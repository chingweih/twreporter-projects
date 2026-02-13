<script lang="ts">
    import Note from "../components/Note.svelte";

    let player: HTMLAudioElement;
    let isPaused = $state(true);
    let isPlaying = $derived(!isPaused);
    let playerFullTime = $state(0);
    let playerCurrentTime = $state(0);
    let playerProgress = $derived(playerCurrentTime / playerFullTime);

    const instruments: {
        name: string;
        notes: { length: number; rest?: boolean }[];
    }[] = [
        {
            name: "Bass",
            notes: [
                { length: 1, rest: true },
                { length: 2 },
                { length: 1 },
                { length: 2 },
                { length: 2 },
            ],
        },
        {
            name: "合成器",
            notes: [
                {
                    length: 1,
                    rest: true,
                },
                { length: 2 },
                { length: 1 },
                { length: 1 },
                { length: 1 },
                { length: 2 },
            ],
        },
        {
            name: "Other",
            notes: [
                { length: 1, rest: true },
                { length: 2 },
                { length: 1 },
                { length: 2 },
                { length: 2 },
            ],
        },
    ];

    const notes = instruments
        .map((instrument) =>
            instrument.notes.reduce(
                (acc, { length, rest }, i) => {
                    return [
                        ...acc,
                        {
                            sum: (acc[i - 1]?.sum ?? 0) + (length ?? 0),
                            rest,
                            note: length === 2 ? 4 : 8,
                            length,
                        },
                    ];
                },
                [] as {
                    sum: number;
                    rest?: boolean;
                    note: number;
                    length: number;
                }[],
            ),
        )
        .flat();

    $inspect(notes);
</script>

<div class="container">
    <div
        class="instruments"
        style:grid-template-rows={`repeat(${instruments.length}, 50px)`}
    >
        {#each instruments as instrument}
            <p>{instrument.name}</p>
        {/each}
    </div>
    <div
        class="notes"
        style:grid-template-rows={`repeat(${instruments.length}, 50px)`}
    >
        {#each notes as { sum, note, rest, length }}
            <Note active={playerProgress >= (sum - length) / 8} {rest} {note} />
        {/each}

        <div class="player-head" style:left={`${playerProgress * 100}%`}></div>
    </div>
</div>

<div class="controls">
    <button
        onclick={() => {
            if (isPlaying) {
                player.pause();
            } else {
                player.play();
            }
        }}>{isPlaying ? "Pause" : "Play"}</button
    >
    <button>Reset</button>
</div>
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
        align-items: center;
        justify-content: start;
        width: 20%;
    }

    .notes {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
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

    .controls {
        padding: 20px 0;
        display: flex;
        gap: 15px;
    }

    .controls button {
        background-color: #333;
        color: white;
        border-radius: 10000000px;
        padding: 4px 16px;

        &:hover {
            background-color: #222;
        }
    }
</style>
