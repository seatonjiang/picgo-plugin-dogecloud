# picgo-plugin-dogecloud

使用多吉云存储作为 PicGo 图床插件

![picgo-plugin-dogecloud](https://raw.githubusercontent.com/seatonjiang/picgo-plugin-dogecloud/refs/heads/main/.github/assets/picgo-plugin-dogecloud.png)

## 📚 参数说明

| 参数 | 是否必填 | 描述 |
| :---: | :---: | ---- |
| `accessKey` | 是 | AccessKey，可以在「[多吉云 - 用户中心 - 密钥管理](https://console.dogecloud.com/user/keys)」中获取 |
| `secretKey` | 是 | SecretKey，可以在「[多吉云 - 用户中心 - 密钥管理](https://console.dogecloud.com/user/keys)」中获取 |
| `bucket` | 是 | 存储空间名称，可以在「[多吉云 - 云存储 - 存储空间列表](https://console.dogecloud.com/oss/list)」中获取 |
| `customUrl` | 是 | 需要填写已绑定的加速域名 |
| `path`| 否 | 保存到存储空间的路径，支持固定参数 `{year}`、`{month}`、`{day}`、`{md5}`，留空则存储在根目录 |

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
