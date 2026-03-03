<script lang="ts">
    import { getAudioContext } from "svelte-audio-player";
    import { toggle } from "svelte-audio-player/utils";

    const paths = {
        play: "M12.5 7.5L3.00758e-07 15L9.53674e-07 -5.48698e-07L12.5 7.5L12.5 7.5Z",
        stop: "M15 15L-1.60659e-06 15L-9.53674e-07 0L15 0L15 15Z",
    };

    const { paused } = getAudioContext();
</script>

<button onclick={() => toggle(paused)} title={$paused ? "Play" : "Stop"}>
    <svg
        width="13"
        height="15"
        viewBox="0 0 13 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d={$paused ? paths.play : paths.stop}
            fill="var(--color, currentColor)"
        />
    </svg>
</button>

<style>
    path {
        transition: d 0.3s ease;
    }
</style>
