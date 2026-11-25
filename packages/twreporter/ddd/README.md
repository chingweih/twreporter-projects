![output](https://github.com/user-attachments/assets/5c73d695-a34d-4eb6-8c2f-a9f539da8803)

## Create a project

From `packages/twreporter/ddd`:

```sh
pnpm install
pnpm create-project
```

Enter the project slug and first component slug when prompted. You can also pass both names:

```sh
pnpm create-project 2026-10-population chart
cd 2026-10-population
pnpm install
pnpm dev
```

Storybook is the development server. Projects remain in the parent workspace and can contain multiple components. Each registered component gets its own script and JSON Schema.

See the generated project's README for development and deployment commands.

## Publish components

From the project directory, use `pnpm deploy:dev` for a preview or `pnpm deploy:prod` to publish. Locally, run `gcloud auth application-default login` first. In CI, install dev dependencies and configure Application Default Credentials through Workload Identity Federation. Set `GOOGLE_CLOUD_PROJECT` if the SDK cannot detect your Google Cloud project.

- **OTA.** Keep `version` in `components.config.ts`. The deploy replaces `components/<name>-v<version>/embed.js`. The production schema stays fixed. Use dev to preview schema edits before a version bump.
- **Breaking release.** Increase `version` and use the new script, schema, and preview URLs in the CMS. Keep the component name and HTML tag. Load only one version of a tag per document, including across client-side navigation.
- **CMS edits.** Update `src` or `config` in the CMS. The component does not need a build.

Open the Storybook URL printed by the deploy and copy the URLs below the graphic. For existing CMS embeds, switch the script, schema, and preview URLs once to adopt OTA updates. CMS preview URLs point to the Storybook build they came from. Copy a newer preview URL if editors need to see an OTA in the preview.

If a deploy fails, rerun the same `pnpm deploy:dev` or `pnpm deploy:prod` command to get a new build ID. For a versioned rollback, copy the previous `embed-<build-id>.js` over that version's `embed.js` with `gcloud storage cp --cache-control=no-cache --if-generation-match=<live-generation>`.

Omit `version` to publish timestamped scripts and schemas.
