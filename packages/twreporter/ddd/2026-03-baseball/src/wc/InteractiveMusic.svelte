<script lang="ts">
    let player: HTMLAudioElement;
    let isPlaying = $state(false);
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
        <div>0</div>
        <div class="note-4">X</div>
        <div>X</div>
        <div>X</div>
        <div>X</div>
        <div class="note-4">X</div>
        <div>0</div>
        <div class="note-4">X</div>
        <div>X</div>
        <div>X</div>
        <div>X</div>
        <div class="note-4">X</div>
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
    ontimeupdate={() => {
        playerFullTime = player.duration;
        playerCurrentTime = player.currentTime;
    }}
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
        gap: 5px;
        width: 80%;
        position: relative;
    }

    .note-4 {
        grid-column: span 2;
    }

    .player-head {
        position: absolute;
        height: 100%;
        width: 4px;
        background-color: #333;
        opacity: 0.5;
        transition: all 0.5s ease;
    }
</style>
