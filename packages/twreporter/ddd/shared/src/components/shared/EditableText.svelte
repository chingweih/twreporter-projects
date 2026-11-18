<script lang="ts">
  let {
    value = $bindable(''),
    editable = false,
    placeholder = '',
  }: {
    value?: string | null
    editable?: boolean
    placeholder?: string
  } = $props()
</script>

{#if editable}
  <span
    contenteditable="plaintext-only"
    data-placeholder={placeholder}
    bind:innerText={
      () => value ?? '',
      (text) => {
        value = text
      }
    }
  ></span>
{:else}
  <span>{value || placeholder}</span>
{/if}

<style>
  [contenteditable] {
    cursor: text;
    white-space: pre-line;
    outline: 1px dashed transparent;
    outline-offset: 2px;
  }
  [contenteditable]:empty::before {
    content: attr(data-placeholder);
    color: var(--neutral-gray-500);
  }
  [contenteditable]:hover,
  [contenteditable]:focus {
    outline-color: var(--neutral-gray-400);
  }
</style>
