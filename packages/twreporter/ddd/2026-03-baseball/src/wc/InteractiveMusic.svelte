<script lang="ts">
    import { getAudioContext } from "svelte-audio-player";
    import Note from "../components/Note.svelte";
    import PlayControls from "../components/PlayControls.svelte";
    import SongCard from "../components/SongCard.svelte";
    import type {
        TrackConfig,
        TrackStates,
    } from "../lib/interactive-music/constants";

    let {
        songTitle,
        states,
        endingPadding,
        repeatPadding,
        active = $bindable(),
    }: {
        songTitle: string;
        states: TrackStates;
        endingPadding: number;
        repeatPadding: number;
        active: TrackConfig;
    } = $props();

    const totalBeats = $derived(
        active?.tracks[0].notes.reduce((acc, item) => acc + item.length, 0) ??
            0,
    );
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
        active?.tracks.map((instrument) => ({
            ...instrument,
            notes: instrument.notes.reduce(
                (acc, { length, rest, text }, i) => {
                    return [
                        ...acc,
                        {
                            sum: (acc[i - 1]?.sum ?? 0) + (length ?? 0),
                            rest,
                            note: 8 / length,
                            length,
                            text,
                        },
                    ];
                },
                [] as {
                    sum: number;
                    rest?: boolean;
                    note: number;
                    length: number;
                    text?: string;
                }[],
            ),
        })),
    );
</script>

<div class="controls">
    <PlayControls {paused} />
    <div class="control">
        <button
            onclick={() => (active = states.default)}
            class:active={active.name == states.default.name}
            >{states.default.name}</button
        >
        <button
            onclick={() => (active = states.alternative)}
            class:active={active.name == states.alternative.name}
            >{states.alternative.name}</button
        >
    </div>
</div>

<div class="container">
    <SongCard title={songTitle}>
        <img
            src="https://storage.googleapis.com/data-reporter-infographics/dev/2026-03-baseball/assets/test.svg"
            alt={songTitle}
        />
    </SongCard>

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
                    {#each notes as { sum, note, rest, length, text }}
                        <Note
                            active={playerProgress >=
                                (sum - length) / totalBeats}
                            {rest}
                            {note}
                            {text}
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
        align-items: stretch;
        gap: 10px;
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

    @media (max-width: 700px) {
        .instruments {
            width: 60px;
        }
    }

    .instrument {
        flex-shrink: 0;
        width: 100%;
        height: 40px;
        background: var(--track-background);
        border-radius: 10px;
        display: flex;
        align-items: center;
        padding: 0 10px;
        overflow: hidden;
    }

    .instrument p {
        font-weight: bold;
        font-size: 14px;
        color: var(--black-700);
        white-space: nowrap;
    }

    .tracks {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        gap: 9px;
        position: relative;
    }

    .notes {
        flex: 1;
        height: 40px;
        background: var(--background-muted);
        background-image: linear-gradient(to right, #ccc 1px, transparent 1px);
        background-size: calc(var(--background-size-frac, 12.5%) - 2px) 100%;
        background-position: left 15.6px top 0;
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
        padding: 3px 10px;
    }

    .control button {
        color: var(--blue-primary);
        font-size: 15px;
        cursor: pointer;
        padding: 1px 10px;
        border-radius: 99vw;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        flex-grow: 1;

        &:hover {
            color: var(--blue-primary);
        }
    }

    .control button.active {
        background: var(--blue-primary);
        color: white;
    }
</style>
