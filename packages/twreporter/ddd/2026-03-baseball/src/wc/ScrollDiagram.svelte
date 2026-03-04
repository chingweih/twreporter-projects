<script lang="ts">
    import { ScrollerBase } from '@reuters-graphics/graphics-components'
    import Source from '../lib/components/diagram/Source.svelte'
    import {
        nodes,
        steps,
        type NodeMeta,
        type ScrollStep,
    } from '../lib/constants/scroll-diagram'
    import {
        computeNodePositions,
        attachNodeClickHandlers,
    } from '../lib/utils/svg-nodes'
    import { MouseDrag } from '../lib/utils/mouse-drag.svelte'

    let index = $state(0)
    let selectedNode: NodeMeta | null = $state(null)
    let canvasEl: HTMLDivElement | undefined = $state()
    let viewportEl: HTMLDivElement | undefined = $state()
    let nodePositions: Map<string, { cx: number; cy: number }> = $state(
        new Map(),
    )
    let svgWidth = $state(952)
    let svgHeight = $state(616)

    const nodeMap = new Map(nodes.map((n) => [n.id, n]))
    const drag = new MouseDrag()

    $effect(() => {
        if (!canvasEl) return
        const svg = canvasEl.querySelector('svg')
        if (!svg) return
        svgWidth = svg.viewBox.baseVal.width || 952
        svgHeight = svg.viewBox.baseVal.height || 616
        nodePositions = computeNodePositions(canvasEl)
    })

    $effect(() => {
        if (!canvasEl) return
        return attachNodeClickHandlers(canvasEl, nodeMap, (meta) => {
            selectedNode = selectedNode?.id === meta.id ? null : meta
        })
    })

    $effect(() => {
        void index
        drag.reset()
    })

    let audioEl: HTMLAudioElement | undefined

    $effect(() => {
        const src = steps[index]?.audio
        if (audioEl) {
            audioEl.pause()
            audioEl = undefined
        }
        if (!src) return
        const audio = new Audio(src)
        audio.loop = true
        audio.play().catch(() => {})
        audioEl = audio
        return () => audio.pause()
    })

    function resolveView(step: ScrollStep) {
        const pos = nodePositions.get(step.to)
        if (!pos) return { x: svgWidth / 2, y: svgHeight / 2, scale: 1 }
        return { x: pos.cx, y: pos.cy, scale: step.scale ?? 2.5 }
    }

    const currentStep = $derived(steps[index] ?? steps[0])

    const transform = $derived.by(() => {
        if (!viewportEl || nodePositions.size === 0) {
            return 'translate(0px, 0px) scale(1)'
        }
        const { x, y, scale } = resolveView(currentStep)
        const tx = viewportEl.clientWidth / 2 - x * scale + drag.offset.x
        const ty = viewportEl.clientHeight / 2 - y * scale + drag.offset.y
        return `translate(${tx}px, ${ty}px) scale(${scale})`
    })

    const transitionStyle = $derived(
        drag.isDragging ? 'none' : 'transform 800ms ease-out',
    )
</script>

<ScrollerBase
    top={0}
    threshold={0.5}
    bottom={1}
    bind:index
    query='div.step'
>
    {#snippet backgroundSnippet()}
        <div
            class="viewport"
            class:draggable={drag.isMousePointer}
            class:dragging={drag.isDragging}
            bind:this={viewportEl}
            onpointerdown={drag.handlePointerDown}
            onpointermove={drag.handlePointerMove}
            onpointerup={drag.handlePointerUp}
            onpointercancel={drag.handlePointerUp}
            onclick={(e) => {
                if ((e.target as Element).closest('[id^="node__"]')) return
                selectedNode = null
            }}
        >
            <div
                class="canvas"
                style="transform: {transform}; transition: {transitionStyle};"
                bind:this={canvasEl}
            >
                <Source />
            </div>
        </div>
    {/snippet}
    {#snippet foregroundSnippet()}
        {#each steps as step}
            <div class="step">
                {#if step.text}
                    <div class="card">{step.text}</div>
                {/if}
            </div>
        {/each}
    {/snippet}
</ScrollerBase>

{#if selectedNode}
    <aside class="sidebar">
        <button class="sidebar-close" onclick={() => (selectedNode = null)}>
            X
        </button>
        <h3 class="sidebar-title">{selectedNode.label}</h3>
        {#if selectedNode.team}
            <p class="sidebar-field">
                <span class="sidebar-label">Team</span>
                {selectedNode.team}
            </p>
        {/if}
        {#if selectedNode.song}
            <p class="sidebar-field">
                <span class="sidebar-label">Song</span>
                {selectedNode.song}
            </p>
        {/if}
        {#if selectedNode.genre}
            <p class="sidebar-field">
                <span class="sidebar-label">Genre</span>
                {selectedNode.genre}
            </p>
        {/if}
        {#if selectedNode.description}
            <p class="sidebar-desc">{selectedNode.description}</p>
        {/if}
    </aside>
{/if}

<style>
    :global(svelte-scroller-background-container) {
        pointer-events: auto !important;
    }

    :global(svelte-scroller-foreground) {
        pointer-events: none;
    }

    .viewport {
        width: 100vw;
        height: 100dvh;
        overflow: hidden;
        position: relative;
        touch-action: pan-y;
    }

    .viewport.draggable {
        cursor: grab;
    }

    .viewport.dragging {
        cursor: grabbing;
        user-select: none;
    }

    .canvas {
        transform-origin: 0 0;
        will-change: transform;
        position: absolute;
        top: 0;
        left: 0;
    }

    .canvas :global(svg) {
        display: block;
    }

    .step {
        height: 100dvh;
        width: 80vw;
        display: flex;
        align-items: center;
        justify-content: end;
    }

    .card {
        pointer-events: auto;
        background: rgba(255, 255, 255, 0.85);
        color: var(--back-900, #1a1a1a);
        padding: 16px 24px;
        max-width: 360px;
        border-radius: 8px;
        backdrop-filter: blur(8px);
        line-height: 1.6;
        font-size: 16px;
    }

    .sidebar {
        position: fixed;
        top: 0;
        right: 0;
        width: 320px;
        max-width: 90vw;
        height: 100dvh;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(12px);
        padding: 24px;
        box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
        z-index: 100;
        overflow-y: auto;
        color: var(--back-900, #1a1a1a);
    }

    .sidebar-close {
        position: absolute;
        top: 16px;
        right: 16px;
        border: none;
        background: none;
        font-size: 18px;
        cursor: pointer;
        color: var(--back-900, #1a1a1a);
        padding: 4px 8px;
    }

    .sidebar-title {
        font-size: 24px;
        font-weight: 900;
        margin: 0 0 16px;
    }

    .sidebar-field {
        margin: 8px 0;
        font-size: 15px;
    }

    .sidebar-label {
        font-weight: 700;
        margin-right: 8px;
        opacity: 0.6;
        text-transform: uppercase;
        font-size: 12px;
    }

    .sidebar-desc {
        margin: 16px 0 0;
        font-size: 15px;
        line-height: 1.6;
        opacity: 0.8;
    }
</style>
