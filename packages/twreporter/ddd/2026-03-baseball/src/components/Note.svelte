<script lang="ts">
    let { note = 8, active = false, rest = false } = $props();
    let pulse = $state(false);

    $effect(() => {
        if (active === true) {
            pulse = true;
        }
    });
</script>

<div class={`note-${note}`} style:opacity={rest ? 0 : 1}>
    <div
        class="note"
        class:active={pulse}
        onanimationend={() => (pulse = false)}
    ></div>
</div>

<style>
    .note {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #808080;
        transform-origin: center center;
    }

    .note-4 {
        grid-column: span 2;
    }

    .note-2 {
        grid-column: span 4;
    }

    .active {
        animation-name: active;
        animation-duration: 0.5s;
        animation-timing-function: ease-out;
    }

    @keyframes active {
        50% {
            transform: scale(1.5);
        }
    }
</style>
