<script lang="ts">
    import { AudioPlayer } from 'svelte-audio-player'
    import PianoRoll from '../components/PianoRoll.svelte'
    import { pianoScores } from '../lib/interactive-piano/constants'
</script>

<div class="scores">
    {#each pianoScores as score}
        <AudioPlayer src={score.src}>
            <PianoRoll {score} />
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
