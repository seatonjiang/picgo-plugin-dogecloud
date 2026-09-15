const crypto = require("crypto");
const https = require("https");
const path = require("path");
const { promisify } = require("util");
const { S3, PutObjectCommand } = require("@aws-sdk/client-s3");
const mime = require("mime-types");

// 临时密钥缓存
const tokenCache = new Map();

/**
 * 调用多吉云 API，签名算法：https://docs.dogecloud.com/oss/api-access-token
 */
function dogecloudApi(apiPath, data, accessKey, secretKey) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const sign = crypto
      .createHmac("sha1", secretKey)
      .update(Buffer.from(apiPath + "\n" + body, "utf8"))
      .digest("hex");
    const authorization = `TOKEN ${accessKey}:${sign}`;

    const req = https.request(
      {
        hostname: "api.dogecloud.com",
        path: apiPath,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          Authorization: authorization,
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          let json;
          try {
            json = JSON.parse(raw);
          } catch (e) {
            reject(new Error(`多吉云 API 返回数据解析失败：${raw}`));
            return;
          }
          if (json.code !== 200) {
            reject(new Error(`多吉云 API 错误：${json.msg}`));
            return;
          }
          resolve(json.data);
        });
      },
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

/**
 * 获取（缓存的）S3 临时密钥与存储空间信息
 */
async function getBucketCredentials(accessKey, secretKey, bucket) {
  const cacheKey = `${accessKey}:${bucket}`;
  const cached = tokenCache.get(cacheKey);
  const now = Date.now() / 1000;
  if (cached && cached.expiredAt - now > 60) {
    return cached;
  }

  const data = await dogecloudApi(
    "/auth/tmp_token.json",
    { channel: "OSS_FULL", scopes: [`${bucket}:*`] },
    accessKey,
    secretKey,
  );

  const bucketInfo = (data.Buckets || []).find((item) => item.name === bucket);
  if (!bucketInfo) {
    throw new Error(
      `未找到名为 "${bucket}" 的存储空间，请检查配置的存储空间名称是否正确`,
    );
  }

  const result = {
    credentials: data.Credentials,
    s3Bucket: bucketInfo.s3Bucket,
    s3Endpoint: bucketInfo.s3Endpoint,
    expiredAt: data.ExpiredAt,
  };
  tokenCache.set(cacheKey, result);
  return result;
}

function getMimeType(fileName) {
  return mime.lookup(fileName) || "application/octet-stream";
}

// 替换存储路径模板中的 {year}/{month}/{day}/{md5} 占位符
function resolvePathTemplate(template, { md5, date }) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return template
    .replace(/\{year\}/g, year)
    .replace(/\{month\}/g, month)
    .replace(/\{day\}/g, day)
    .replace(/\{md5\}/g, md5);
}

function buildKey(pathPrefix, fileName, body) {
  const template = pathPrefix || "";
  const hasMd5Placeholder = template.includes("{md5}");
  const md5 = hasMd5Placeholder
    ? crypto.createHash("md5").update(body).digest("hex")
    : "";
  const resolved = resolvePathTemplate(template, { md5, date: new Date() });
  const prefix = resolved.replace(/^\/+|\/+$/g, "");

  // 路径中使用了 {md5} 时，用解析结果替代原文件名，仅保留原扩展名，同时把新文件名回传给调用方以同步相册显示
  if (hasMd5Placeholder) {
    const extname = path.extname(fileName);
    const key = prefix ? `${prefix}${extname}` : `${md5}${extname}`;
    return { key, fileName: path.basename(key) };
  }

  const key = prefix ? `${prefix}/${fileName}` : fileName;
  return { key, fileName };
}

function buildUrl(customUrl, key) {
  const base = customUrl.replace(/\/+$/, "");
  return `${base}/${key}`;
}

function extractKeyFromUrl(customUrl, imgUrl) {
  const base = customUrl.replace(/\/+$/, "") + "/";
  return imgUrl.startsWith(base) ? imgUrl.slice(base.length) : null;
}

function createS3Client(credentials, s3Endpoint) {
  const client = new S3({
    region: "automatic",
    endpoint: s3Endpoint,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
    requestChecksumCalculation: "ALWAYS",
    disableMultiregionAccessPoints: true,
    defaultSigningAlgorithm: "MD5",
  });

  return client;
}

async function uploadDogecloud(ctx) {
  const userConfig = ctx.getConfig("picBed.dogecloud");
  if (!userConfig) {
    throw new Error("找不到 DogeCloud 图床配置");
  }
  const {
    accessKey,
    secretKey,
    bucket,
    path: pathPrefix,
    customUrl,
  } = userConfig;
  if (!accessKey || !secretKey || !bucket || !customUrl) {
    throw new Error(
      "DogeCloud 图床配置不完整，请检查 AccessKey / SecretKey / 存储空间名称 / 自定义域名",
    );
  }

  const { credentials, s3Bucket, s3Endpoint } = await getBucketCredentials(
    accessKey,
    secretKey,
    bucket,
  );

  const s3 = createS3Client(credentials, s3Endpoint);

  const imgList = ctx.output;
  for (let i = 0; i < imgList.length; i++) {
    const image = imgList[i];
    if (image.fileName && (image.buffer || image.base64Image)) {
      const body = image.buffer || Buffer.from(image.base64Image, "base64");
      const { key, fileName } = buildKey(pathPrefix, image.fileName, body);

      try {
        await s3.send(
          new PutObjectCommand({
            Bucket: s3Bucket,
            Key: key,
            Body: body,
            ContentType: getMimeType(image.fileName),
          }),
        );
      } catch (err) {
        ctx.log.error(err);
        throw new Error(`上传到多吉云失败：${err.message || err}`);
      }

      delete image.base64Image;
      delete image.buffer;
      image.fileName = fileName;
      image.imgUrl = buildUrl(customUrl, key);
      image.url = image.imgUrl;
    }
  }

  return ctx;
}

/**
 * 相册删除图片时同步删除多吉云上对应的文件
 */
async function deleteFromDogecloud(ctx, files) {
  const userConfig = ctx.getConfig("picBed.dogecloud");
  if (!userConfig) return;
  const { accessKey, secretKey, bucket, customUrl } = userConfig;
  if (!accessKey || !secretKey || !bucket || !customUrl) return;

  const targets = (files || []).filter(
    (file) => file.type === "dogecloud" && file.imgUrl,
  );
  if (targets.length === 0) return;

  const keys = targets
    .map((file) => extractKeyFromUrl(customUrl, file.imgUrl))
    .filter((key) => !!key);
  if (keys.length === 0) return;

  try {
    const { credentials, s3Bucket, s3Endpoint } = await getBucketCredentials(
      accessKey,
      secretKey,
      bucket,
    );
    const s3 = createS3Client(credentials, s3Endpoint);
    const deleteObject = promisify(s3.deleteObject).bind(s3);
    await Promise.all(
      keys.map((key) =>
        deleteObject({
          Bucket: s3Bucket,
          Key: key,
        }),
      ),
    );
  } catch (err) {
    ctx.log.error(err);
    ctx.emit("notification", {
      title: "多吉云文件删除失败",
      body: err.message || String(err),
    });
  }
}

function pluginConfig(ctx) {
  const userConfig = ctx.getConfig("picBed.dogecloud") || {};
  return [
    {
      name: "accessKey",
      type: "input",
      default: userConfig.accessKey || "",
      required: true,
      message: "请前往多吉云控制台「用户中心 - 密钥管理」获取",
      alias: "AccessKey",
    },
    {
      name: "secretKey",
      type: "password",
      default: userConfig.secretKey || "",
      required: true,
      message: "请前往多吉云控制台「用户中心 - 密钥管理」获取",
      alias: "SecretKey",
    },
    {
      name: "bucket",
      type: "input",
      default: userConfig.bucket || "",
      required: true,
      message: "请前往多吉云控制台「云存储 - 存储空间列表」获取",
      alias: "存储空间名称",
    },
    {
      name: "customUrl",
      type: "input",
      default: userConfig.customUrl || "",
      required: true,
      message: "已绑定的加速域名，例如 https://imgs.example.com",
      alias: "加速域名",
    },
    {
      name: "path",
      type: "input",
      default: userConfig.path || "",
      required: false,
      message: "留空则存储在根目录，支持固定参数，例如 {year}/{md5}",
      alias: "存储路径",
    },
  ];
}

module.exports = (ctx) => {
  const register = () => {
    ctx.helper.uploader.register("dogecloud", {
      handle: uploadDogecloud,
      name: "多吉云",
      config: pluginConfig,
    });
    ctx.on("remove", (files) => {
      deleteFromDogecloud(ctx, files);
    });
  };
  return {
    uploader: "dogecloud",
    register,
  };
};
