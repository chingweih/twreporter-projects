# 2026-07-kodokushi

腳本尋找前端中內成對的 `.ddd-anchor[data-section][data-type]`，並將區間內的段落使用 [pretext](https://github.com/chenglou/pretext) 重新排列為文繞圖版面。

## Development

```bash
pnpm dev
```

- 圖片與錨點設定位於 `src/illustrations.json`
- 文章文字由 CMS 管理
- viewport 小於 768px 時使用 `mobile`。

每個 CMS 區段使用同名的起訖錨點：

```html
<div class="ddd-anchor" data-section="pol" data-type="start"></div>
<!-- CMS paragraphs -->
<div class="ddd-anchor" data-section="pol" data-type="end"></div>
```

- 圖片設定的 `target` 對應 `data-section`，`anchor` 是區段內從 0 開始的內容區塊索引，
- 標題也包含在內。圖片會以該區塊的起點定位，並可影響標題與後續段落的繞文。

### Local Script Testing

在測試文章的 embed code 區塊加入：

```html
<script
  type="module"
  src="http://localhost:5173/src/article-script.ts"
  defer
></script>
```

## `#editor` 圖片編輯模式

在文章網址後加上 `#editor`：拖曳插圖可移動，按住 Shift 拖曳可縮放。
編輯器只修改目前 breakpoint 的設定；小於 768px 修改 `mobile`，否則修改
`desktop`。每次操作完成後，包含兩套設定的完整 JSON 會直接複製到剪貼簿，
並輸出到瀏覽器 console，可直接覆蓋 `src/illustrations.json`。

## Build and Deploy

```bash
pnpm build
pnpm deploy:dev
pnpm deploy:prod
```

部署內容包括：

- `js/script-<timestamp>.js`
- `assets/img/*.png`
- `assets/vid/*.webm`

## CMS Embed Code Script

```html
<script
  type="module"
  src="https://projects.twreporter.org/twreporter/ddd/2026-07-kodokushi/js/script-<timestamp>.js"
  defer
></script>
```
