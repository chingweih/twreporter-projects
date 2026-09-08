# 2026-07-kodokushi

腳本尋找前端中內成對的 `.ddd-anchor[data-section][data-type]`，並將區間內的段落使用 [pretext](https://github.com/chenglou/pretext) 重新排列為文繞圖版面。

## Development

```bash
pnpm dev
```

- 圖片與錨點設定位於 `src/illustrations.json`
- 文章文字由 CMS 管理
- viewport 小於 768px 時使用 `mobile`。

預設插圖依據 [dynamicLayout.js](https://storage.googleapis.com/projects.twreporter.org/twreporter/ddd/2026-07-kodokushi/js/dynamicLayout.js) 更新，五個區段依序對應 `vil`、`pol`、`forensic`、`dis`、`charity`。來源的 `anchor` 只計算段落，此處加 1 以包含區段開頭的標題；未指定 mobile 設定的插圖沿用 desktop 的位置與寬度。

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
  src="http://localhost:5173/src/main.ts"
  defer
></script>
```

## `#editor` 圖片編輯模式

在文章網址後加上 `#editor`：拖曳插圖可移動，按住 Shift 拖曳可縮放。
編輯器只修改目前 breakpoint 的設定；小於 768px 修改 `mobile`，否則修改 `desktop`。每次操作完成後，包含兩套設定的完整 JSON 會直接複製到剪貼簿，並輸出到瀏覽器 console，可直接覆蓋 `src/illustrations.json`。

## Graphics CMS

執行 `pnpm build` 後，將 `dist/kodokushi.schema.json` 的內容貼入 graphics-cms 圖表的 Schema 欄位並儲存。Schema 由 `src/config.ts` 產生，預設值使用 `src/illustrations.json`，Config 可編輯 `desktop` 與 `mobile` 的插圖 URL、區段、內容區塊索引、位置與寬度。Sources 不需設定，文章文字仍由文章 CMS 管理。

預覽 URL 使用載入此腳本的文章頁。Graphics CMS 會加上 `edit` query parameter，啟用拖曳與 Shift 拖曳縮放；操作完成後會透過 `graphic:update` 回傳完整 Config，不會自動複製剪貼簿。Config 表單的修改透過 `graphic:set` 更新預覽並重新繞文，儲存圖表即可保留修改。

發佈後，在 embed script 執行前將 config.json URL 指定給 `window.__twreporter_dynamic_layout_config`，不再讀取文章網址的 `config` query parameter。未指定時使用內建設定；連上 graphics-cms 後，以 CMS 傳來的設定為準。手機／桌機設定依預覽 iframe 的 viewport 寬度選擇，graphics-cms 的 Viewport width slider 可設定實際寬度，高度固定為 768px；Zoom 的 −／＋ 按鈕只縮放顯示比例。

本機驗證使用上方的 Local Script Testing embed code。Chromium 必須允許測試文章網域存取本機網路，才能從遠端文章載入 `http://localhost:5173/src/main.ts`。

## Build and Deploy

```bash
pnpm build
pnpm deploy:dev
pnpm deploy:prod
```

部署內容包括：

- `js/script-<timestamp>.js`
- `kodokushi.schema.json`，本機 build 產物，供貼入 graphics-cms 使用
- `assets/img/*.png`
- `assets/vid/*.webm`

## CMS Embed Code Script

將下方 config.json URL 換成 graphics-cms 發佈的網址；若使用內建設定，可省略第一段 script。

```html
<script>
  window.__twreporter_dynamic_layout_config = 'https://example.com/config.json'
</script>
<script
  type="module"
  src="https://projects.twreporter.org/twreporter/ddd/2026-07-kodokushi/js/script-<timestamp>.js"
  defer
></script>
```
