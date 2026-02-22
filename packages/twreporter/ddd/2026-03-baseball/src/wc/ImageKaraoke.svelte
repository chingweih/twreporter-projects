<script lang="ts">
    import Score from "../components/Score.svelte";
    import { AudioPlayer } from "svelte-audio-player";

    const scores: { name: string; audio: string; image: string }[] = [
        {
            name: "Team Taiwan",
            audio: "https://storage.googleapis.com/data-reporter-infographics/dev/2026-03-baseball/audios/tsg-sample.mp3",
            image: "https://storage.googleapis.com/data-reporter-infographics/dev/2026-03-baseball/scores/test.png",
        },
        {
            name: "黃昏的故鄉",
            audio: "https://storage.googleapis.com/data-reporter-infographics/dev/2026-03-baseball/audios/tsg-sample.mp3",
            image: "https://storage.googleapis.com/data-reporter-infographics/dev/2026-03-baseball/scores/test.png",
        },
    ];
</script>

<div class="scores">
    {#each scores as { name, audio, image }}
        <AudioPlayer src={audio}>
            <Score {name} src={image} />
        </AudioPlayer>
    {/each}
</div>

<style>
    .scores {
        display: flex;
        flex-direction: column;
        gap: 3px;
    }
</style>
