# 像素星球官网素材目录

本目录存放官网所需的文案、链接与图片。修改 JSON 后刷新页面即可生效（需通过 HTTP 服务器访问，见文末）。

## 目录说明

```
site-content/
├── brand/          品牌视觉（Logo、Favicon、分享图）
├── screenshots/    应用截图
├── downloads/      各商店下载链接
├── copy/           多语言文案
├── social/         社交媒体链接
└── theme/          主题色（可选）
```

---

## 待填写清单

### 1. 品牌素材 `brand/`

| 文件 | 状态 | 说明 |
|------|------|------|
| `logo.svg` | 占位图 | 可替换为正式 Logo（SVG 或 PNG） |
| `logo.png` | **待添加** | 建议 512×512，用于 Apple Touch Icon |
| `favicon.ico` | **待添加** | 浏览器标签小图标，32×32 |
| `og-image.png` | **待添加** | 社交分享预览图，1200×630 |

替换 Logo 后，若使用 PNG，请同步修改 `index.html` 中两处 `logo.svg` 为 `logo.png`。

### 2. 下载链接 `downloads/links.json`

```json
{
  "app_store": "填写 App Store 完整 URL",
  "google_play": "填写 Google Play 完整 URL",
  "apkpure": "填写 APKPure 完整 URL",
  "app_store_available": true,
  "google_play_available": true,
  "apkpure_available": true
}
```

- 链接以 `TODO:` 开头或 `*_available` 为 `false` 时，按钮显示为灰色「即将推出」
- 填写真实链接后，将对应 `*_available` 设为 `true`

### 3. 文案 `copy/zh-CN.json`、`en.json`、`ja.json`

搜索 `TODO:` 并替换为正式内容：

- `tagline` — 一句话 Slogan
- `description_short` — Hero 区短介绍（2–3 句）
- `description_long` — 「关于应用」长介绍（1–2 段）
- `features[]` — 3 个功能亮点（`title`、`description`、`icon`）

`icon` 可选值：`star`、`grid`、`sparkle`

已填好：`app_name`、`developer`、`email` 相关 Footer 文案、版本号占位

### 4. 截图 `screenshots/`

按语言分子目录存放，切换语言时自动加载对应截图：

```
screenshots/
├── zh/       ← 中文（zh-CN）
│   ├── 01.png
│   ├── 02.png
│   └── ...
├── en/       ← 英文
│   ├── 01.png
│   └── ...
└── ja/       ← 日文
    ├── 01.jpg
    └── ...
```

- Hero 区手机框固定展示该语言的 **第一张**（`01.png` / `01.jpg`）
- 下方「应用截图」区域展示该语言目录下的 **全部** 截图
- 增删截图时，同步修改 `manifest.json` 中对应语言的 `files` 列表

### 5. 社交媒体 `social/links.json`

已填写：`email` → `katherine931019@163.com`

其余平台留空则不显示，填写 URL 后自动出现对应按钮：

```json
{
  "twitter": "",
  "discord": "",
  "telegram": "",
  "youtube": "",
  "instagram": "",
  "weibo": "",
  "bilibili": "",
  "xiaohongshu": "",
  "email": "katherine931019@163.com",
  "website": ""
}
```

### 6. 主题色 `theme/colors.json`（可选）

已提供默认深空紫配色，可按品牌色调整 `primary`、`accent` 等字段。

---

## 本地预览

页面通过 JavaScript 加载 JSON，**不能**直接双击 `index.html`（`file://` 会跨域失败）。

在项目根目录运行：

```bash
python3 -m http.server 8080
```

浏览器打开：http://localhost:8080

---

## 部署

将整个仓库部署到 GitHub Pages / Cloudflare Pages 等静态托管即可。`index.html` 作为首页。

已有页面链接关系：

- 首页 → `index.html`
- 隐私政策 → `private.html` / `private_en.html` / `private_ja.html`（随语言切换）
- 支持联系 → `support.html`
