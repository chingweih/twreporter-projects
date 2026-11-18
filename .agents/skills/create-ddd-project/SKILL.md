---
name: create-ddd-project
description: Create a new DDD Svelte web-component project in this repository using the existing template and pnpm create-project generator.
---

# Create a DDD project

Use the generator in `packages/twreporter/ddd`. Do not copy an existing project or render the Handlebars templates by hand.

## Inputs

Resolve the project slug and first component slug from the request. Ask for any missing slug before generating files. The project slug commonly includes a date, such as `2026-10-population`; the component slug describes the first component, such as `chart`. These are examples, not defaults.

- Project slugs use lowercase letters, digits, and single hyphens between segments. The destination must not exist.
- Component slugs start with a lowercase letter and use lowercase letters, digits, and single hyphens between segments.

## Generate

Read the current [DDD README](../../../packages/twreporter/ddd/README.md), [template README](../../../packages/twreporter/ddd/template/README.md), and [generator](../../../packages/twreporter/ddd/plopfile.mjs). They own the setup commands, validation, and template behavior. Check the runtime requirement in the [generated README template](../../../packages/twreporter/ddd/template/README.md.hbs).

From the repository root, change to `packages/twreporter/ddd`. If the generator dependencies are missing, run `pnpm install` there. Set `project_slug` and `component_slug` to the agreed values, then run:

```sh
pnpm create-project "$project_slug" "$component_slug"
```

The generator renders `template/**/*.hbs`, including hidden files, into the new project and adds its slug to `pnpm-workspace.yaml`. Let it perform both operations. Dependency versions come from `shared/package.json`.

If generation fails, inspect the error and any partial output before retrying. Do not overwrite an existing directory or delete files whose ownership is unclear.

Immediately after project creation, read the generated project's `AGENTS.md` before making further changes or running project commands. Follow its instructions for subsequent work.

Read the generated project's `README.md`, then run `pnpm install` from its directory. Keep the project in the parent workspace with `@lab-reporter/ddd-shared` as a `workspace:*` dependency and retain the shared configuration imports.

Creating the starter completes this workflow. Implement component behavior only when the request includes it. Storybook is the development server; start it only when requested. Deploy only when requested.

## Verify and report

Inspect the generated files and workspace diff. Confirm that the project is registered once, the first component has a registry entry and generated source files, and no Handlebars placeholders remain. Run the generated project's type, format, and build checks as required by its instructions. Do not add tests or use a browser unless requested.

Report the new project path, first component slug, dependency installation and check results, and the `pnpm dev` command to run from that directory.
