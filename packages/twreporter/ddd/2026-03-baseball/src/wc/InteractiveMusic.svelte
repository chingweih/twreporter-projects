<script lang="ts">
    import { getAudioContext } from "svelte-audio-player";
    import { toggle } from "svelte-audio-player/utils";
    import Note from "../components/Note.svelte";
    import { interactiveMusicState } from "../lib/interactive-music/state.svelte";
    import Play from "../components/icons/play.svelte";
    import Pause from "../components/icons/pause.svelte";
    import { tracks } from "../lib/interactive-music/constants";

    const songTitle = "台剛雄鷹〈氣蓋山河〉";
    const totalBeats = 16;
    const endingPadding = 3;
    const repeatPadding = 0.5;

    const { currentTime, duration, paused, repeat } = getAudioContext();
    repeat.set(true);

    let playerProgress = $derived(
        Math.min($currentTime / ($duration - endingPadding), 1),
    );

    $effect(() => {
        if ($currentTime > $duration - endingPadding + repeatPadding) {
            currentTime.set(0);
        }
    });

    const instruments = $derived(
        interactiveMusicState.active.tracks.map((instrument) => ({
            ...instrument,
            notes: instrument.notes.reduce(
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
        })),
    );
</script>

<div class="controls">
    <div class="control">
        <button onclick={() => paused.set(false)}>
            <Play />
        </button>
        <button onclick={() => paused.set(true)}>
            <Pause />
        </button>
    </div>
    <div class="control">
        <button onclick={() => (interactiveMusicState.active = tracks.notSwing)}
            >去除反拍</button
        >
        <button onclick={() => (interactiveMusicState.active = tracks.default)}
            >原曲加入反拍</button
        >
    </div>
</div>

<div class="container">
    <div class="song-card">
        <div class="song-card-header">
            <div class="song-dot"></div>
            <p class="song-title">{songTitle}</p>
        </div>
        <div class="song-card-content">
            <img
                src="https://storage.googleapis.com/data-reporter-infographics/dev/2026-03-baseball/assets/test.svg"
                alt={songTitle}
            />
        </div>
    </div>

    <div class="player">
        <div class="instruments">
            {#each instruments as { name }}
                <div class="instrument">
                    <p>{name}</p>
                </div>
            {/each}
        </div>
        <div
            class="tracks"
            style:--background-size-frac={`${(100 / totalBeats) * 2}%`}
        >
            {#each instruments as { notes }}
                <div class="notes" style:--total-beats={totalBeats}>
                    {#each notes as { sum, note, rest, length }}
                        <Note
                            active={playerProgress >=
                                (sum - length) / totalBeats}
                            {rest}
                            {note}
                        />
                    {/each}
                </div>
            {/each}
            <div
                class="player-head"
                style:left={`${playerProgress * 100}%`}
            ></div>
        </div>
    </div>
</div>

<style>
    .container {
        display: flex;
        align-items: flex-start;
        gap: 10px;
    }

    .song-card {
        width: 130px;
        background: white;
        border-radius: 5px;
        padding: 0px 5px 5px;
        height: 100%;
    }

    .song-card-header {
        background: white;
        padding: 5px 0;
        border-radius: 10px 10px 0 0;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .song-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--blue-primary);
        flex-shrink: 0;
    }

    .song-title {
        font-size: 11px;
        color: var(--black-900);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .song-card-content {
        background: var(--box-background);
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        box-shadow: inset 0 5px 10px rgba(202, 197, 187, 0.5);
    }

    .player {
        display: flex;
        gap: 9px;
        position: relative;
        width: 100%;
    }

    .instruments {
        display: flex;
        flex-direction: column;
        gap: 9px;
        width: 80px;
    }

    .instrument {
        flex-shrink: 0;
        width: 80px;
        height: 40px;
        background: rgba(239, 237, 233, 0.5);
        border-radius: 10px;
        display: flex;
        align-items: center;
        padding: 0 10px;
        overflow: hidden;
    }

    .instrument p {
        font-weight: bold;
        font-size: 14px;
        color: var(--track-background);
        white-space: nowrap;
    }

    .tracks {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        gap: 9px;
        position: relative;
        background-image: linear-gradient(to right, #ccc 1px, transparent 1px);
        background-size: calc(var(--background-size-frac, 12.5%) - 2px) 100%;
        background-position: left 15.6px top 0;
    }

    .notes {
        flex: 1;
        height: 40px;
        background: rgba(239, 237, 233, 0.2);
        padding: 0px 8px;
        border-radius: 10px;
        display: grid;
        grid-template-columns: repeat(var(--total-beats, 8), 1fr);
        align-items: center;
        justify-items: start;
        min-width: 0;
    }

    .player-head {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 5px;
        background: var(--blue-primary);
        border-radius: 3px;
        will-change: left;
        filter: drop-shadow(2px 0 4px rgba(0, 0, 0, 0.25));
    }

    .controls {
        padding: 5px 0 15px;
        display: flex;
        gap: 10px;
        align-items: center;
        justify-content: start;
    }

    .control {
        background-color: white;
        border-radius: 10000px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        height: 30px;
        padding: 6px 20px;
    }

    .control button {
        color: var(--blue-primary);
        font-size: 15px;
        cursor: pointer;

        &:hover {
            color: var(--blue-primary);
        }
    }
</style>
