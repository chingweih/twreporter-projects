# 2026-11-election-vote

Use Node.js 22.18 or later. Run commands from this project directory.

## Development

```sh
pnpm install
pnpm dev
```

Storybook runs on port 5173. The first batch is defined in `src/lib/batches/first.ts`. It uses `public/election-vote.json` and appears in `src/wc/ElectionVote.stories.svelte`. Its graphics read data from the election spreadsheet and share the same `config` JSON URL.

The graphic editor can edit each graphic's title and footnotes, and the batch credit in `sharedFootnote`. Add `edit` to the iframe URL to enable editing.

## Add a component

- Put the Svelte component and its `*.wc.svelte` wrapper in `src/wc`. Add its title and footnotes under a numbered key in the batch JSON, render it in that batch's story, and pass its batch definition to `ElectionGraphic`.
- Add an entry like `src/wc/city-map.ts` using the config key without its number. The registry uses that name for the entry and output directory.
- Use a component name and custom element tag that are unique across the project.

## Add a batch

- Put its JSON in `public` with its own `sharedFootnote` and numbered graphic keys.
- Use `defineElectionBatch` in `src/lib/batches` to link that JSON to a Storybook story ID. Add the definition to the batch list in `components.config.ts`.
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
