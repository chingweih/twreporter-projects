<script lang="ts">
    import { AudioPlayer } from "svelte-audio-player";
    import PianoRoll from "../components/PianoRoll.svelte";
    import type { PianoScoreConfig } from "../lib/interactive-piano/constants";
    import AudioController from "../components/AudioController.svelte";

    const { scores }: { scores: PianoScoreConfig[] } = $props();
</script>

<div class="scores">
    {#each scores as score}
        <AudioPlayer src={score.src}>
            <AudioController>
                <PianoRoll {score} />
            </AudioController>
        </AudioPlayer>
    {/each}
</div>

<style>
    .scores {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
</style>
