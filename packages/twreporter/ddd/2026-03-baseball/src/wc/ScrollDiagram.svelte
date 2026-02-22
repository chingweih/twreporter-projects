<script lang="ts">
    import { ScrollerBase } from "@reuters-graphics/graphics-components";
    import { SvelteFlow, type Edge, type Node } from "@xyflow/svelte";
    import {
        COL_GAP,
        columns,
        headerId,
        itemId,
        ROW_GAP,
    } from "../lib/svelte-flow/constants";

    let nodes = $state.raw<Node[]>(
        columns.flatMap((col, colIdx) => [
            {
                id: headerId({ colIdx }),
                type: "input" as const,
                data: { label: col.header },
                position: { x: colIdx * COL_GAP, y: 0 },
            },
            ...col.items.map((item, itemIdx) => ({
                id: itemId({ colIdx, itemIdx }),
                type: "default" as const,
                data: { label: item },
                position: { x: colIdx * COL_GAP, y: (itemIdx + 1) * ROW_GAP },
            })),
        ]),
    );

    let edges = $state.raw<Edge[]>(
        columns.flatMap((col, colIdx) =>
            col.items.map((_, itemIdx) => {
                const colPrefix = `c${colIdx + 1}`;
                const source =
                    itemIdx === 0
                        ? `${colPrefix}-header`
                        : `${colPrefix}-${itemIdx}`;
                const target = `${colPrefix}-${itemIdx + 1}`;
                return {
                    id: `e-${source}-${target}`,
                    source,
                    target,
                };
            }),
        ),
    );

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
    query="div.step"
>
    {#snippet backgroundSnippet()}
        <div class="background">
            <SvelteFlow
                bind:nodes
                bind:edges
                fitView
                fitViewOptions={{
                    padding: 0.2,
                }}
                defaultEdgeOptions={{
                    animated: true,
                }}
            ></SvelteFlow>
        </div>
    {/snippet}
    {#snippet foregroundSnippet()}
        <div class="step"><div class="card">第一段</div></div>
        <div class="step"><div class="card">第二段</div></div>
        <div class="step"><div class="card">第三段</div></div>
        <div class="step"><div class="card">第四段</div></div>
    {/snippet}
</ScrollerBase>

<style>
    .background {
        width: 100vw;
        height: 100vh;
        transition: all ease 0.5s;
    }

    .step {
        height: 100vh;
        width: 80%;
        padding: 1em 50px;
        margin: 0 0 2em 0;
        display: flex;
        align-items: center;
        justify-content: end;
    }

    .card {
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 10px 20px;
        min-width: 300px;
    }
</style>
