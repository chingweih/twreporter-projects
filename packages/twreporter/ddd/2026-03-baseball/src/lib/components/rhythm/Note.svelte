<script lang="ts">
    import type { TrackStyle } from "../../constants/interactive-music";
    import Bass from "../icons/Bass.svelte";
    import Drum from "../icons/Drum.svelte";
    import Spark from "../icons/Spark.svelte";
    import SparkTwist from "../icons/SparkTwist.svelte";

    let {
        note = 8,
        active = false,
        rest = false,
        text,
        style = "note",
        swing,
    }: {
        note?: number;
        active?: boolean;
        rest?: boolean;
        text?: string;
        style?: TrackStyle;
        swing?: true;
    } = $props();

    let pulse = $state(false);
    let color = $derived(swing ? "var(--pink-primary)" : "var(--blue-primary)");

    $effect(() => {
        if (active === true) {
            pulse = true;
        }
    });
</script>

<div class={`note note-${note}`} style:opacity={rest ? 0 : 1}>
    <div
        class="start"
        class:active={pulse}
        class:swing
        onanimationend={() => (pulse = false)}
    >
        {#if text}
            <p data-text={text}>{text}</p>
        {:else if style == "note"}
            {#if swing}
                <SparkTwist --color={color} />
            {:else}
                <Spark --color={color} />
            {/if}
        {:else if style == "bass"}
            <Bass --color={color} />
        {:else if style == "drum"}
            <Drum --color={color} />
        {/if}
    </div>
</div>

<style>
    .star {
        width: 15px;
        height: 15px;
        transform-origin: center center;
    }

    .start.swing {
        transform: rotate(180deg);
        animation-composition: add;
    }

    .note-8 {
        grid-column: span 1;
    }

    .note-4 {
        grid-column: span 2;
    }

    .note-2 {
        grid-column: span 4;
    }

    .active {
        animation-name: active;
        animation-duration: 200ms;
    }

    @keyframes active {
        50% {
            transform: scale(1.5);
        }
    }

    p {
        color: #f2f1ed;
        font-weight: 700;
        font-size: 20px;
        text-align: center;
        text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
        z-index: 0;
        text-shadow:
            -1px -1px 0 var(--blue-primary),
            1px -1px 0 var(--blue-primary),
            -1px 1px 0 var(--blue-primary),
            1px 1px 0 var(--blue-primary);
    }
</style>
