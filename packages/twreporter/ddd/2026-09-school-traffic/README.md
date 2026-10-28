# 2026-09-school-traffic

Use Node.js 22.18 or later. Run `pnpm dev` for Storybook on port 5173. The Default story shows a sample route; the PlayCanvas story connects the game to the wrapper and map.

`PlayerTrackMap.svelte` accepts `getTrack` and `getInfoBoxes`. It polls the track once per second while visible and loads infoboxes once. Click a point to open its content. The map fills the desktop viewport with horizontal scrolling and runs vertically on mobile. Game scripts are maintained in PlayCanvas.

Run `pnpm check-types`, `pnpm format:check`, and `pnpm build`. Deploy with `pnpm deploy:dev` or `pnpm deploy:prod`.
