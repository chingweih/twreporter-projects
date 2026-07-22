# 2026-07-kodokushi

「被拒領的無緣大體，流落何方？」文章頁前端排版腳本。腳本尋找 CMS 內成對的
`.ddd-anchor[data-section][data-type]`，並將區間內的段落排成同一個圖片繞文 flow。

## 本機開發

```bash
pnpm dev
```

圖片與錨點設定位於 `src/illustrations.json`；文章文字由 CMS 管理。

每個 CMS 區段使用同名的起訖錨點：

```html
<div class="ddd-anchor" data-section="pol" data-type="start"></div>
<!-- CMS paragraphs -->
<div class="ddd-anchor" data-section="pol" data-type="end"></div>
```

圖片設定的 `target` 對應 `data-section`，`anchor` 是區段內從 0 開始的段落索引。
圖片會以該段落的起點定位，並可自然延伸、影響後續段落的繞文。
腳本在 `keystone-editor.twreporter.org` 會直接停止，不修改編輯器 DOM。

### 在 CMS 測試頁載入本機腳本

在測試文章的 embedded code 區塊加入：

```html
<script
  type="module"
  src="http://localhost:5173/src/article-script.ts"
  defer
></script>
```

## Pretext 與圖片排版

專案使用 `@chenglou/pretext` 計算每一行文字可用的空間，讓段落能依照 PNG 透明區域繞過插圖。圖片的位置、大小與錨點定義在 `src/illustrations.json`。

`pnpm check:layout` 會測試 `subtractIntervals` 的核心邊界情況，包括重疊遮罩、超出內容欄的遮罩，以及整行完全被圖片遮住的情況。

## `#editor` 圖片編輯模式

在文章網址後加上 `#editor`：拖曳插圖可移動，按住 Shift 拖曳可縮放。
每次操作完成後，完整的 JSON 設定會直接複製到剪貼簿，並輸出到瀏覽器
console。可直接以剪貼簿內容覆蓋 `src/illustrations.json`。

## Build 與部署

```bash
pnpm build
```

此指令只會建立 production bundle。部署至 GCS 使用：

```bash
pnpm deploy:dev
pnpm deploy:prod
```

部署內容包括：

- `js/dynamicLayout.js`
- `assets/img/*.png`
- `assets/vid/*.webm`

所有檔案使用 `Cache-Control: no-cache`，以固定 URL 更新，無須調整文章內的版本參數。

## CMS script

```html
<script
  src="https://projects.twreporter.org/twreporter/ddd/2026-07-kodokushi/js/dynamicLayout.js"
  defer
></script>
```
