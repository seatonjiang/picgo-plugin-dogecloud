# picgo-plugin-dogecloud

使用多吉云存储作为 PicGo 图床插件

![picgo-plugin-dogecloud](https://raw.githubusercontent.com/seatonjiang/picgo-plugin-dogecloud/refs/heads/main/.github/assets/picgo-plugin-dogecloud.png)

## 📚 参数说明

| 参数 | 是否必填 | 描述 |
| :---: | :---: | ---- |
| `accessKey` | 是 | 多吉云平台 AccessKey |
| `secretKey` | 是 | 多吉云平台 SecretKey |
| `bucket` | 是 | 存储空间名称 |
| `customUrl` | 是 | 加速域名，需要填写已绑定的加速域名 |
| `path`| 否 | 存储路径，支持固定占位符，不填存储在根目录 |

| 占位符 | 描述 |
| :---: | ---- |
| `year` | 4 位年份，例如 `2026` |
| `month` | 2 位月份，例如 `01` |
| `day` | 2 位日期，例如 `08` |
| `md5` | 文件内容完整 MD5 哈希值 |
| `sha1` | 文件内容完整 SHA1 哈希值 |
| `sha256` | 文件内容完整 SHA256 哈希值 |
| `shortmd5` | 文件内容 MD5 哈希值的前 12 位 |

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
