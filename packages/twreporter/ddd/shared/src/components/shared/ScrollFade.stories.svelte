<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Layout from './Layout.svelte'
  import ScrollFade from './ScrollFade.svelte'

  const { Story } = defineMeta({
    title: 'UI/ScrollFade',
    component: ScrollFade,
    parameters: { layout: 'padded', controls: { include: ['label'] } },
    args: { label: 'Months' },
  })
</script>

<Story name="Horizontal overflow">
  {#snippet template({ label })}
    <Layout>
      <div style="max-width: 320px; background: var(--neutral-gray-50)">
        <ScrollFade {label}>
          <ul class="months">
            {#each ['January', 'February', 'March', 'April', 'May', 'June'] as month (month)}
              <li>{month}</li>
            {/each}
          </ul>
        </ScrollFade>
      </div>
    </Layout>
  {/snippet}
</Story>

<style>
  .months {
    display: flex;
    width: max-content;
    gap: 8px;
    padding: 8px;
    list-style: none;
  }

  li {
    min-width: 85px;
    padding: 8px;
    background: var(--chart-blue-1);
    text-align: center;
  }
</style>
