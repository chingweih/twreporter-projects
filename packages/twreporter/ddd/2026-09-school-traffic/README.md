# 2026-09-school-traffic

Use Node.js 22.18 or later. Run `pnpm dev` for Storybook on port 5173. The Default story shows a sample route; the PlayCanvas story connects the game to the wrapper and map.

`PlayerTrackMap.svelte` accepts `getTrack` and `getInfoBoxes`. It polls the track once per second while visible and loads infoboxes once. Click a point to open its content. The map fills the desktop viewport with horizontal scrolling and runs vertically on mobile. Game scripts are maintained in PlayCanvas.

Open **Tools / Coordinate calibration** in Storybook to align the streamed SOG with the drone image. The tool starts with no reference points and restores only your saved manual draft. Choose **Add reference**, click a ground landmark in the overhead SOG, then click the same landmark in the drone image. Add at least three pairs spread across both sides of the road. Select a point to replace either position, or use **Focus** to zoom both views to it. Hover over the SOG in **Inspect** mode to preview the mapped position in red. All points can be edited or deleted. **Clear all points** starts again, and **Undo** restores the previous edit. The tool saves drafts in this browser and supports importing an exported map. Export `coordinate-map.json` and replace `src/lib/constants/coordinate-map.json` to apply the mapping. Triangles partition SOG world space and independently interpolate drone coordinates, allowing local stretch, shear, compression, and reversal in the stitched image. SOG positions must be distinct and enclose an area. The tool is excluded from the shipped web component.

Run `pnpm check-types`, `pnpm format:check`, and `pnpm build`. Deploy with `pnpm deploy:dev` or `pnpm deploy:prod`.
