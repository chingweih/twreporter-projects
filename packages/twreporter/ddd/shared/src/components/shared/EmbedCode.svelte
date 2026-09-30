<script lang="ts">
  import { generateEmbedCode } from '../../utils/embed-code.ts'
  import type { ComponentProps } from '../types.ts'

  const {
    componentName,
    tagName,
    src,
    config,
  }: ComponentProps & {
    componentName: string
    tagName?: string
  } = $props()
  const code = $derived(
    generateEmbedCode(componentName, { src, config }, tagName),
  )
  const editing = new URLSearchParams(window.location.search).has('edit')
  let status = $state('')
</script>

{#if !editing}<div class="embed-code">
    <textarea readonly aria-label="Embed code" value={code}></textarea>
    <button
      type="button"
      onclick={async () => {
        try {
          await navigator.clipboard.writeText(code)
          status = 'Copied!'
        } catch {
          status = 'Could not copy. Select and copy the code manually.'
        }
      }}>Copy</button
    >
    <span role="status">{status}</span>
  </div>{/if}

<style>
  .embed-code {
    margin-top: 10px;
  }

  button {
    font: inherit;
  }

  textarea {
    box-sizing: border-box;
    display: block;
    width: 100%;
    height: 100px;
    margin-bottom: 8px;
    font-family: 'Roboto Slab', 'Noto Sans TC', sans-serif;
  }
</style>
