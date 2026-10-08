# picgo-plugin-dogecloud

使用多吉云存储作为 PicGo 图床插件

![picgo-plugin-dogecloud](https://raw.githubusercontent.com/seatonjiang/picgo-plugin-dogecloud/refs/heads/main/.github/assets/picgo-plugin-dogecloud.png)

## 📚 参数说明

| 参数 | 是否必填 | 描述 |
| :---: | :---: | ---- |
| `accessKey` | 是 | 多吉云平台 AccessKey，可在控制台「用户中心 - 密钥管理」获取 |
| `secretKey` | 是 | 多吉云平台 SecretKey，可在控制台「用户中心 - 密钥管理」获取 |
| `bucket` | 是 | 存储空间名称，可在控制台「云存储 - 存储空间列表」获取 |
| `customUrl` | 是 | 加速域名，需要填写已绑定的加速域名，例如 `https://imgs.example.com` |
| `path`| 否 | 存储路径，支持占位符，例如 `{year}/{month}/{shortmd5}`，不填则存储在根目录 |

`path` 支持以下占位符，可自由组合使用：

| 占位符 | 描述 |
| :---: | ---- |
| `{year}` | 4 位年份，例如 `2026` |
| `{month}` | 2 位月份，例如 `01` |
| `{day}` | 2 位日期，例如 `08` |
| `{md5}` | 文件内容完整 MD5 哈希值 |
| `{sha1}` | 文件内容完整 SHA1 哈希值 |
| `{sha256}` | 文件内容完整 SHA256 哈希值 |
| `{shortmd5}` | 文件内容 MD5 哈希值的前 12 位 |

> 💡 当 `path` 中包含哈希类占位符（`md5`/`sha1`/`sha256`/`shortmd5`）时，解析结果会替代原文件名（仅保留原扩展名）作为最终文件名，常用于文件去重；若不包含哈希占位符，则仅用于生成存储目录，原文件名保持不变。

## 💖 项目支持

如果这个项目为你带来了便利，请考虑为这个项目点个 Star 或者通过微信赞赏码支持我，每一份支持都是我持续优化和添加新功能的动力源泉！

<div align="center">
    <b>微信赞赏码</b>
    <br>
    <img src="https://raw.githubusercontent.com/seatonjiang/picgo-plugin-dogecloud/refs/heads/main/.github/assets/wechat-reward.png" width="230">
</div>

## 🤝 参与共建

我们欢迎所有的贡献，你可以将任何想法作为 [Pull Requests](https://github.com/seatonjiang/picgo-plugin-dogecloud/pulls) 或 [Issues](https://github.com/seatonjiang/picgo-plugin-dogecloud/issues) 提交。

## 📃 开源许可

项目基于 MIT 许可证发布，详细说明请参阅 [LICENSE](https://github.com/seatonjiang/picgo-plugin-dogecloud/blob/main/LICENSE) 文件。
