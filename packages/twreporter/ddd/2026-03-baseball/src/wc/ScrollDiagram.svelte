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
    import ViewportController, {
        type ViewState,
    } from "./ViewportController.svelte";

    const nodes: Node[] = columns.flatMap((col, colIdx) => [
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
    ]);

    const edges: Edge[] = columns.flatMap((col, colIdx) =>
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
    );

    let index = $state(0);

    const viewStates: ViewState[] = [
        { padding: 0.2 },
        { nodeIds: ["c2-5"], zoom: 2.5, padding: 0.3 },
        { nodeIds: ["c5-1", "c5-2", "c5-3"], zoom: 2, padding: 0.3 },
        { nodeIds: ["c9-4"], zoom: 3, padding: 0.3 },
    ];
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
    top={0.1}
    threshold={0.5}
    bottom={0.9}
    bind:index
    query="div.step"
>
    {#snippet backgroundSnippet()}
        <div class="background">
            <SvelteFlow
                {nodes}
                {edges}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                defaultEdgeOptions={{ animated: true }}
                panOnDrag={false}
                zoomOnScroll={false}
                zoomOnPinch={false}
                zoomOnDoubleClick={false}
                nodesDraggable={false}
                preventScrolling={false}
            >
                <ViewportController {viewStates} {index} />
            </SvelteFlow>
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
        width: 100%;
        height: 100dvh;
    }

    .step {
        height: 100dvh;
        width: 80%;
        padding: 1em 50px;
        margin: 0 0 2em 0;
        display: flex;
        align-items: center;
        justify-content: end;
    }

    .card {
        background: linear-gradient(
            180deg,
            rgba(0, 112, 207, 1) 0%,
            rgba(18, 148, 233, 1) 49%,
            rgba(0, 112, 207, 1) 100%
        );
        color: white;
        padding: 10px 20px;
        min-width: 300px;
        border-radius: 5px;
        border: 2px solid #004987;
    }
</style>
