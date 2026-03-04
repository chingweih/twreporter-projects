<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLButtonAttributes } from "svelte/elements";

    const {
        children,
        ...buttonProps
    }: { children: Snippet } & HTMLButtonAttributes = $props();
</script>

<button {...buttonProps}>
    {@render children()}
</button>

<style>
    button {
        color: var(--color);
        display: flex;
        justify-content: center;
        align-items: center;
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: linear-gradient(180deg, #fafaf8 0%, #fafaf8 100%);
        box-shadow: var(--inner-shadow);
    }
</style>
