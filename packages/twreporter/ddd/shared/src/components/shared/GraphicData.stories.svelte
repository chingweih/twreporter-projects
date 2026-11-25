<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import { barChartConfigSchema } from '../bar-chart/types.ts'
  import GraphicData from './GraphicData.svelte'
  import Layout from './Layout.svelte'
  import Shell from './Shell.svelte'

  const context = Symbol('graphic-data-story')
  const { Story } = defineMeta({
    title: 'Editor/GraphicData',
    component: GraphicData,
    parameters: { controls: { include: ['src', 'config'] } },
    args: {
      src: './bar-chart/vertical.csv',
      config: './bar-chart/vertical.json',
    },
  })
</script>

<Story name="Config and CSV">
  {#snippet template({ src, config })}
    <Layout>
      <GraphicData
        name="graphic-data-story"
        schema={barChartConfigSchema}
        {context}
        {src}
        {config}
      >
        {#snippet children(graphic)}
          <Shell
            title={graphic.config?.title}
            loading={graphic.loading}
            error={graphic.error}
            empty={!graphic.csv}
          >
            {#if graphic.csv}
              <p>{graphic.csv.rows.length} source rows</p>
              <table>
                <thead>
                  <tr>
                    {#each graphic.csv.headers as header (header)}<th
                        scope="col">{header}</th
                      >{/each}
                  </tr>
                </thead>
                <tbody>
                  {#each graphic.csv.rows.slice(0, 3) as row}
                    <tr>
                      {#each graphic.csv.headers as header (header)}<td
                          >{row[header]}</td
                        >{/each}
                    </tr>
                  {/each}
                </tbody>
              </table>
            {/if}
          </Shell>
        {/snippet}
      </GraphicData>
    </Layout>
  {/snippet}
</Story>

<style>
  th,
  td {
    padding: 4px 8px;
    border-bottom: 1px solid var(--neutral-gray-300);
    text-align: left;
  }
</style>
