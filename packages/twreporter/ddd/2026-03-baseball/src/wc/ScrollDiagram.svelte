<script lang="ts">
    import { ScrollerBase } from "@reuters-graphics/graphics-components";

    // Optional: Bind your own variables to use them in your code.
    let count = $state(1);
    let index = $state(0);
    let offset = $state(0);
    let progress = $state(0);
    let top = $state(0.1);
    let threshold = $state(0.5);
    let bottom = $state(0.9);
</script>

<ScrollerBase
    {top}
    {threshold}
    {bottom}
    bind:count
    bind:index
    bind:offset
    bind:progress
    query="div.step-foreground-container"
>
    {#snippet backgroundSnippet()}
        <!-- Add custom background HTML or component -->
        <p class="mb-0">
            Current step: <strong>{index + 1}/{count}</strong>
        </p>
        <progress class="mb-4" value={(index + 1) / count}></progress>

        <p class="mb-0">Offset in current step</p>
        <progress class="mb-4" value={offset}></progress>

        <p class="mb-0">Total progress</p>
        <progress class="mb-4" value={progress}></progress>
    {/snippet}
    {#snippet foregroundSnippet()}
        <!-- Add custom foreground HTML or component -->
        <div class="step-foreground-container">Step 1</div>
        <div class="step-foreground-container">Step 2</div>
        <div class="step-foreground-container">Step 3</div>
        <div class="step-foreground-container">Step 4</div>
        <div class="step-foreground-container">Step 5</div>
    {/snippet}
</ScrollerBase>

<style lang="scss">
    .step-foreground-container {
        height: 100vh;
        width: 50%;
        background-color: rgba(0, 0, 0, 0.2);
        padding: 1em;
        margin: 0 0 2em 0;
        position: relative;
        left: 50%;
    }
</style>
