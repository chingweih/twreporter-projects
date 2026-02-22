<script lang="ts">
    import { ScrollerBase } from "@reuters-graphics/graphics-components";
    import {
        SvelteFlow,
        type DefaultEdgeOptions,
        type Edge,
        type FitViewOptions,
        type Node,
    } from "@xyflow/svelte";

    let nodes = $state.raw<Node[]>([
        {
            id: "1",
            type: "input",
            data: { label: "Node 1" },
            position: { x: 5, y: 5 },
        },
        {
            id: "2",
            type: "default",
            data: { label: "Node 2" },
            position: { x: 5, y: 100 },
        },
    ]);

    let edges = $state.raw<Edge[]>([{ id: "e1-2", source: "1", target: "2" }]);

    const fitViewOptions: FitViewOptions = {
        padding: 0.2,
    };

    const defaultEdgeOptions: DefaultEdgeOptions = {
        animated: true,
    };

    let count = $state(1);
    let index = $state(0);
    let offset = $state(0);
    let progress = $state(0);
    let top = $state(0.1);
    let threshold = $state(0.5);
    let bottom = $state(0.9);
</script>

<!--
    Currently, importing css file in Svelte custom components
    doesn't inject it into the shadown dom,
    instead link it directly from jsDelivr force it to be avaliable
-->
<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/@xyflow/svelte/dist/style.css"
    crossorigin="anonymous"
/>

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
        <div class="background">
            <SvelteFlow
                bind:nodes
                bind:edges
                fitView
                {fitViewOptions}
                {defaultEdgeOptions}
            ></SvelteFlow>
        </div>
    {/snippet}
    {#snippet foregroundSnippet()}
        <div class="step-foreground-container">Step 1</div>
        <div class="step-foreground-container">Step 2</div>
        <div class="step-foreground-container">Step 3</div>
        <div class="step-foreground-container">Step 4</div>
        <div class="step-foreground-container">Step 5</div>
    {/snippet}
</ScrollerBase>

<style>
    .background {
        width: 100vw;
        height: 100vh;
    }

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
