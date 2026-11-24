# 2026-11-election-vote

Use Node.js 22.18 or later. Run commands from this project directory.

## Development

```sh
pnpm install
pnpm dev
```

Storybook runs on port 5173. The batch definitions in `src/lib/batches` set the graphic order, default titles, and footnotes. Each batch has a Storybook story and one shared `config` JSON URL. Its graphics read result data from the election spreadsheet.

Development and Storybook builds generate the two config JSON files in `generated/` and serve them at the root of Storybook. Run `pnpm generate:configs` to regenerate the files on their own.

The graphic editor can edit each graphic's title and footnotes, and the batch credit in `sharedFootnote`. Add `edit` to the iframe URL to enable editing.

## Add a component

- Put the component and its `*.wc.svelte` wrapper in `src/wc`. Add the numbered graphic key, title, and any footnotes to its batch definition. Pass that key to `ElectionGraphic`.
- Add an entry such as `src/wc/city-map.ts`. The registry uses the numbered key's suffix as the build name unless the graphic definition supplies `name`.
- To reuse a city component within a batch, give the variants the same `name` and distinct `city` codes. For example, `city="63000"` selects Taipei and `city="65000"` selects New Taipei. `ElectionCityGraphic` selects the corresponding config entry and the preview includes the city in its embed code.

## Add a batch

- Use `defineElectionBatch` in `src/lib/batches` to define the config URL, Storybook story ID, and numbered graphics. Add the definition to the list in `src/lib/batches/index.ts`.
- Add a story in `src/wc` that uses `ElectionBatchPreview` and renders the batch's graphics by key. The preview loads the config once and supplies each graphic's embed code.

## Build and check

```sh
pnpm check-types
pnpm format:check
pnpm build
```

The build creates component scripts and JSON Schemas in `dist/components/<name>` and Storybook in `storybook-static`. Each script exports `schemaUrl`. Script and schema filenames include the same build timestamp.

## Deploy

Authenticate with Google Cloud CLI, then run `pnpm deploy:dev` or `pnpm deploy:prod`. Components are under `<project-url>/components` and Storybook is under `<project-url>/storybook`.

Host the batch config JSON and set its URL in the batch story's `config` control. Use Copy below each graphic to get its embed code.
