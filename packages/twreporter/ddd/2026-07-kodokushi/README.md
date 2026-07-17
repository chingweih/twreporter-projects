# 2026-07-kodokushi

「被拒領的無緣大體，流落何方？」互動圖文元件，使用 Svelte Web Component 製作。

## 本機開發

```bash
pnpm dev
```

開啟開發伺服器後，可在瀏覽器預覽元件；圖片與文字資料位於 `src/lib/`。

## Pretext 與圖片排版

專案使用 `@chenglou/pretext` 計算每一行文字可用的空間，讓段落能依照 PNG 透明區域繞過插圖。圖片的位置、大小與錨點定義在 `src/lib/content.ts`。

## `#editor` 圖片編輯模式

在開發模式開啟 `http://localhost:5173/#editor`，可拖曳及調整插圖位置與大小。按下儲存後，版面數值會直接寫回 `src/lib/content.ts`；production build 不會啟用此模式。

## Build 與部署

```bash
pnpm build
```

此指令會自動以 production URL build，並上傳至 GCS：

- `js/dynamicLayout.js`
- `assets/img/*.png`
- `assets/vid/*.webm`
- `embed.html`

所有檔案使用 `Cache-Control: no-cache`，以固定 URL 更新，無須調整文章內的版本參數。

部署後可於以下網址預覽及複製 embed code：

<https://projects.twreporter.org/twreporter/ddd/2026-07-kodokushi/embed.html>

## Embed code

```html
<link
  rel="stylesheet"
  href="https://projects.twreporter.org/twreporter/ddd/shared/embed.css"
/>

<div class="embed-code-container">
  <script
    src="https://projects.twreporter.org/twreporter/ddd/2026-07-kodokushi/js/dynamicLayout.js"
    defer
  ></script>

  <twreporter-dynamic-layout></twreporter-dynamic-layout>
</div>
```
