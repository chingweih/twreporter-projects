<script lang="ts">
    import { ScrollerBase } from "@reuters-graphics/graphics-components";
    import Background from "../lib/components/icons/Background.svelte";
    import Button from "../lib/components/Button.svelte";
    import {
        nodes,
        steps,
        type NodeMeta,
        type ScrollStep,
    } from "../lib/constants/scroll-diagram";
    import {
        computeNodeBounds,
        computeGroupView,
        attachNodeClickHandlers,
        type NodeBounds,
    } from "../lib/utils/svg-nodes";
    import { MouseDrag } from "../lib/utils/mouse-drag.svelte";
    import AudioWave from "../lib/components/diagram/AudioWave.svelte";
    import AudioProvider from "../lib/components/audio/AudioProvider.svelte";
    import { getYouTubeEmbedUrl } from "../lib/utils/youtube-link";

    let index = $state(0);
    let selectedNode: NodeMeta | null = $state(null);
    let canvasEl: HTMLDivElement | undefined = $state();
    let viewportEl: HTMLDivElement | undefined = $state();

    let diagram = $state<{
        bounds: Map<string, NodeBounds>;
        width: number;
        height: number;
    } | null>(null);

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const drag = new MouseDrag();

    $effect(() => {
        if (!canvasEl) return;
        const el = canvasEl;
        const controller = new AbortController();

        fetch(
            "https://projects.twreporter.org/twreporter/ddd/2026-03-baseball/assets/diagram.svg",
            { signal: controller.signal },
        )
            .then((r) => r.text())
            .then((text) => {
                el.innerHTML = text;
                requestAnimationFrame(() => {
                    const svg = el.querySelector("svg");
                    diagram = {
                        bounds: computeNodeBounds(el),
                        width: svg?.viewBox.baseVal.width || 952,
                        height: svg?.viewBox.baseVal.height || 616,
                    };
                });
            })
            .catch(() => {});

        return () => controller.abort();
    });

    $effect(() => {
        if (!diagram || !canvasEl) return;
        return attachNodeClickHandlers(canvasEl, nodeMap, (meta) => {
            selectedNode = selectedNode?.id === meta.id ? null : meta;
        });
    });

    const currentStep = $derived(steps[index] ?? steps[0]);

    const transform = $derived.by(() => {
        if (!viewportEl || !diagram) return "translate(0px, 0px) scale(1)";

        const { cx, cy, scale } = resolveView(
            currentStep,
            viewportEl,
            diagram.bounds,
            diagram.width,
            diagram.height,
        );
        const tx = viewportEl.clientWidth / 2 - cx * scale + drag.offset.x;
        const ty = viewportEl.clientHeight / 2 - cy * scale + drag.offset.y;
        return `translate(${tx}px, ${ty}px) scale(${scale})`;
    });

    const transition = $derived(
        drag.isDragging
            ? "none"
            : "transform 1000ms cubic-bezier(0.25, 0.1, 0.25, 1)",
    );

    function resolveView(
        step: ScrollStep,
        viewport: HTMLDivElement,
        bounds: Map<string, NodeBounds>,
        svgW: number,
        svgH: number,
    ) {
        const fallback = { cx: svgW / 2, cy: svgH / 2, scale: 1 };
        const group = computeGroupView(
            step.to,
            bounds,
            viewport.clientWidth,
            viewport.clientHeight,
        );
        if (!group) return fallback;
        if (step.scale != null)
            return { cx: group.cx, cy: group.cy, scale: step.scale };
        return group;
    }
</script>

<ScrollerBase top={0} threshold={0.5} bottom={1} bind:index query="div.step">
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
                if ((e.target as Element).closest('[id^="node__"]')) return;
                selectedNode = null;
            }}
        >
            <div
                class="canvas"
                style:transform
                style:transition
                bind:this={canvasEl}
            ></div>
        </div>
    {/snippet}
    {#snippet foregroundSnippet()}
        {#each steps as step, i}
            <div class="step">
                {#if step.text}
                    <div class="card">
                        {step.text}
                        {#if step.audios && index === i}
                            {#each step.audios as { src, name }}
                                <AudioProvider {src}>
                                    <p class="audio-name">{name}</p>
                                    <AudioWave />
                                </AudioProvider>
                            {/each}
                        {/if}
                    </div>
                {/if}
            </div>
        {/each}
    {/snippet}
</ScrollerBase>

{#if selectedNode}
    <div class="popup">
        <Background />
        <div class="popup-content">
            <div class="popup-close">
                <Button onclick={() => (selectedNode = null)}>X</Button>
            </div>
            <h3 class="popup-title">{selectedNode.label}</h3>
            {#if selectedNode.youtube}
                <iframe
                    class="popup-youtube"
                    src={getYouTubeEmbedUrl(selectedNode.youtube)}
                    title={selectedNode.label}
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                ></iframe>
            {/if}
        </div>
    </div>
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
        border-top: 2px dashed #cac5bb;
        border-bottom: 2px dashed #cac5bb;
        background-image: url("https://projects.twreporter.org/twreporter/ddd/2026-03-baseball/umpire/pattern.svg");
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
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: "GenJyuuGothicL", sans-serif;
    }

    .card {
        pointer-events: auto;
        background: rgba(255, 255, 255, 0.85);
        color: var(--back-900, #1a1a1a);
        padding: 16px 24px;
        max-width: 360px;
        backdrop-filter: blur(8px);
        line-height: 1.6;
        font-size: 16px;
    }

    .audio-name {
        margin-top: 20px;
        font-size: 14px;
        font-weight: 300;
    }

    .popup {
        position: fixed;
        top: 75px;
        right: 24px;
        width: 320px;
        padding: 20px;
        max-width: calc(90vw - 48px);
        z-index: 100;
    }

    .popup-content {
        position: relative;
        padding: 28px 24px 24px;
        color: var(--back-900, #1a1a1a);
    }

    .popup-close {
        position: absolute;
        top: 8px;
        right: 12px;
    }

    .popup-title {
        font-size: 20px;
        font-weight: 900;
        margin: 0 0 12px;
        color: white;
    }

    .popup-youtube {
        width: 100%;
        aspect-ratio: 16 / 9;
        border: none;
        border-radius: 8px;
    }
</style>
