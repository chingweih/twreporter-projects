<script lang="ts">
    let {
        note = 8,
        active = false,
        rest = false,
        text,
    }: {
        note?: number;
        active?: boolean;
        rest?: boolean;
        text?: string;
    } = $props();

    let pulse = $state(false);

    $effect(() => {
        if (active === true) {
            pulse = true;
        }
    });
</script>

<div class={`note note-${note}`} style:opacity={rest ? 0 : 1}>
    <div class="start" class:active={pulse}>
        {#if text}
            <p>{text}</p>
        {:else}
            <svg
                width="15px"
                height="15px"
                onanimationend={() => (pulse = false)}
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M10.534 1.586C10.8.6 12.2.6 12.466 1.586l1.536 5.706a1.15 1.15 0 00.706.706l5.706 1.536c.986.266.986 1.666 0 1.932l-5.706 1.536a1.15 1.15 0 00-.706.706l-1.536 5.706c-.266.986-1.666.986-1.932 0L9.998 13.712a1.15 1.15 0 00-.706-.706L3.586 11.47c-.986-.266-.986-1.666 0-1.932l5.706-1.536a1.15 1.15 0 00.706-.706L10.534 1.586z"
                    fill="var(--blue-primary)"
                />
            </svg>
        {/if}
    </div>
</div>

<style>
    .note {
        transition: all 0.5s ease;
    }

    .star {
        width: 15px;
        height: 15px;
        transform-origin: center center;
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
</style>
