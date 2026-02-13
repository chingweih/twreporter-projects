<script lang="ts">
    import Note from "../components/Note.svelte";

    let player: HTMLAudioElement;
    let isPaused = $state(true);
    let isPlaying = $derived(!isPaused);
    let playerFullTime = $state(0);
    let playerCurrentTime = $state(0);
    let playerProgress = $derived(playerCurrentTime / playerFullTime);
</script>

<div class="container">
    <div class="instruments">
        <p>Bass</p>
        <p>合成器</p>
    </div>
    <div class="notes">
        <Note active={playerProgress === 0} rest />
        <Note length={4} active={playerProgress >= 1 / 8} />
        <Note active={playerProgress >= 3 / 8} />
        <Note length={4} active={playerProgress >= 4 / 8} />
        <Note length={4} active={playerProgress >= 6 / 8} />

        <Note active={playerProgress === 0} rest />
        <Note length={4} active={playerProgress >= 1 / 8} />
        <Note active={playerProgress >= 3 / 8} />
        <Note active={playerProgress >= 4 / 8} />
        <Note active={playerProgress >= 5 / 8} />
        <Note length={4} active={playerProgress >= 6 / 8} />

        <div class="player-head" style:left={`${playerProgress * 100}%`}></div>
    </div>
</div>

<button
    onclick={() => {
        if (isPlaying) {
            player.pause();
        } else {
            player.play();
        }
    }}>{isPlaying ? "Pause" : "Play"}</button
>
<audio
    src="https://storage.googleapis.com/data-reporter-infographics/dev/2026-03-baseball/audios/tsg-sample.mp3"
    bind:this={player}
    onplay={() => {
        isPlaying = true;
    }}
    onpause={() => {
        isPlaying = false;
    }}
    onended={() => {
        isPlaying = false;
    }}
    bind:duration={playerFullTime}
    bind:currentTime={playerCurrentTime}
    bind:paused={isPaused}
    loop
></audio>

<style>
    .container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 500px;
    }

    .instruments {
        display: grid;
        grid-template-rows: repeat(2, 50px);
        align-items: center;
        justify-content: start;
        width: 20%;
    }

    .notes {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        grid-template-rows: repeat(2, 50px);
        align-items: center;
        justify-content: center;
        width: 80%;
        position: relative;
        background-image: linear-gradient(to right, #ccc 1px, transparent 1px);
        background-size: 12.5% 100%;
        background-position: left 4px top 0;
    }

    .player-head {
        position: absolute;
        height: 100%;
        width: 4px;
        background-color: #333;
        opacity: 0.5;
        will-change: left;
        margin-left: 3px;
    }
</style>
