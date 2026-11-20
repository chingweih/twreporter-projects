# Project conventions

- Keep this project in the parent pnpm workspace. Use `@lab-reporter/ddd-shared` as a normal `workspace:*` dependency.
- Use Storybook for local development. Keep the shared Storybook, Vite, Svelte, TypeScript, and formatting configs imported from shared. Do not add a separate dev server.
- Register each component's entry, output directory, and batch config schema in `components.config.ts`. Each wrapper needs a unique custom element tag. Shared also has its own component registry.
- Keep wrappers and batch stories in `src/wc`. Give each batch one definition in `src/lib/batches`, one config JSON, and one story using `ElectionBatchPreview`. Keep component-specific data models in `src/lib/components/<name>`. Create other folders only when they contain files. Do not add `.gitkeep` files.
- Import shared source files through `@lab-reporter/ddd-shared/components/...` and `@lab-reporter/ddd-shared/utils/...`, with their file extensions. Reuse shared components and utilities before adding local copies.
- Use shared `Layout`, `Shell`, and `createGraphic`. The `config` prop points to the batch JSON. Render the wrapper without a URL guard so an unpublished CMS graphic can receive editor messages.
- Use `createGraphic` to load the config and handle editor synchronization. Read spreadsheet data through the typed TanStack Query options in `src/lib/election-data.ts`.
- Use `createShellConfigSchema` for title and footnotes. Give each graphic a numbered key in the batch config. Bind the editable Shell fields to that entry and use Shell's `error`, `loading`, `empty`, and `emptyMessage` props for status messages.
- Import public config JSON for defaults and pass it to `createShellConfigSchema`. Keep sample values in the JSON rather than repeating them in schemas.
- Keep result values in the spreadsheet. Use the project city-group mapping for fixed geographic groups. Validate required CSV headers before calculating a chart.
- Config is a CMS form. Add clear field titles and explicit `ui:order` metadata because database JSON storage can reorder object keys. The build emits JSON Schema draft-07 for the CMS validator.
- CMS metadata supports `ui:widget`, `ui:enumNames`, and `ui:options`. Use `layout: 'two-column'` for short mappings and `titleKey` with `collapsible: true` for long arrays. Add matching `ui:order` metadata to nested objects when field order matters.
- Use shared `ChipSelector`, `Tooltip`, and `ScrollFade` where they fit. Use Shell's CSS variables for fixed styles and shared `colorSchema` for editable hex colors with the CMS color picker. Keep project-specific theme colors in the project. Shell and Storybook load Roboto Slab before Noto Sans TC.
- `ElectionBatchPreview` renders shared `EmbedCode` for each graphic using its registry name, actual custom element tag, and batch preview story ID. Re-export shared Storybook preview and parameters; shared sets `layout: 'fullscreen'`.
- Run `pnpm check-types`, `pnpm format:check`, and `pnpm build` for affected packages. Check standalone web-component bundles as well as Storybook when browser validation is requested. Do not deploy or publish CMS records unless requested.
