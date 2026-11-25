<script lang="ts">
  import Layout from '@lab-reporter/ddd-shared/components/shared/Layout.svelte'
  import type { Snippet } from 'svelte'

  const { children }: { children: Snippet } = $props()
</script>

<Layout>
  <div class="election-theme">
    {@render children()}
  </div>
</Layout>

<style>
  .election-theme {
    display: contents;

    --elec-kmt-1: #dde5ef;
    --elec-kmt-2: #c4d2e8;
    --elec-kmt-3: #8ca7d3;
    --elec-kmt-4: #5171a3;
    --elec-kmt-5: #384666;
    --elec-kmt: var(--elec-kmt-3);

    --elec-dpp-1: #e1e9d0;
    --elec-dpp-2: #cad99a;
    --elec-dpp-3: #9eb563;
    --elec-dpp-4: #667d45;
    --elec-dpp-5: #445933;
    --elec-dpp: var(--elec-dpp-3);

    --elec-tpp-1: #d8e9e3;
    --elec-tpp-2: #b2d1cc;
    --elec-tpp-3: #70a3a3;
    --elec-tpp-4: #477171;
    --elec-tpp-5: #30484a;
    --elec-tpp: var(--elec-tpp-3);

    --elec-gogo-1: #ebddf0;
    --elec-gogo-2: #d0b6d9;
    --elec-gogo-3: #a27db4;
    --elec-gogo-4: #77518a;
    --elec-gogo-5: #614766;
    --elec-gogo: var(--elec-gogo-3);

    --elec-grayscale-1: #e8e3e3;
    --elec-grayscale-2: #d1cdcd;
    --elec-grayscale-3: #aaa5a5;
    --elec-grayscale-4: #6b6868;
    --elec-grayscale-5: #464242;
    --elec-grayscale: var(--elec-grayscale-3);

    --elec-red-1: #f5e0e1;
    --elec-red-2: #f5bfc4;
    --elec-red-3: #e27e85;
    --elec-red-4: #a15354;
    --elec-red-5: #69393c;
    --elec-red: var(--elec-red-3);
  }
</style>
