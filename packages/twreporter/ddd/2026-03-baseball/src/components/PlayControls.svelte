<script lang="ts">
    import type { Writable } from 'svelte/store'
    import Pause from './icons/pause.svelte'
    import Play from './icons/play.svelte'

    let { paused }: { paused: Writable<boolean> } = $props()
</script>

<div class="pill">
    <button onclick={() => paused.set(false)}>
        <Play />
    </button>
    <button onclick={() => paused.set(true)}>
        <Pause />
    </button>
</div>

<style>
    .pill {
        width: fit-content;
        background-color: white;
        border-radius: 10000px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        height: 30px;
        padding: 6px 20px;
    }

    .pill button {
        color: var(--blue-primary);
        font-size: 15px;
        cursor: pointer;

        &:hover {
            color: var(--blue-primary);
        }
    }
</style>
