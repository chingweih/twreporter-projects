<script lang="ts">
    import { getAudioContext } from "svelte-audio-player";
    import PlayControls from "./PlayControls.svelte";
    import SongCard from "./SongCard.svelte";
    import {
        pitchToSemitone,
        type PianoNote,
        type PianoScoreConfig,
    } from "../lib/interactive-piano/constants";

    const { score }: { score: PianoScoreConfig } = $props();

    const totalSemis = $derived(score.trackRange[1] - score.trackRange[0] + 1);

    const { currentTime, duration, paused } = getAudioContext();

    let playerProgress = $derived(
        Math.min($currentTime / ($duration - score.endingPadding), 1),
    );

    let currentBeat = $derived(playerProgress * score.totalBeats);

    $effect(() => {
        // Reset player after audio finished.
        if (playerProgress === 1) {
            paused.set(true);
            currentTime.set(0);
        }
    });

    const segmentRanges = $derived.by(() => {
        let cursor = 0;
        return score.segments.map((seg) => {
            const start = cursor;
            const beats = seg.notes.reduce((sum, n) => sum + n.duration, 0);
            cursor += beats;
            return { start, beats };
        });
    });

    const segmentNotes: PianoNote[][] = $derived(
        score.segments.map((seg, segIdx) => {
            let cursor = segmentRanges[segIdx].start;
            const notes: PianoNote[] = [];
            for (const { pitch, duration, rest, text } of seg.notes) {
                notes.push({
                    start: cursor,
                    pitch,
                    duration,
                    rest,
                    segment: segIdx,
                    text,
                });
                cursor += duration;
            }
            return notes;
        }),
    );

    const allNotes = $derived(segmentNotes.flat());

    let activeNote = $derived(
        allNotes.find(
            (n) =>
                !n.rest &&
                currentBeat >= n.start &&
                currentBeat < n.start + n.duration,
        ),
    );

    let activeSegment = $derived(activeNote?.segment ?? -1);

    /**
     * Black key semitone indices and the white key index they sit below.
     *
     * White keys are ordered top-to-bottom: B(0) A(1) G(2) F(3) E(4) D(5) C(6).
     * A black key centered on the boundary below white key `wk` means its
     * center is at: (wk + 1) * keyHeight + wk * gap, where
     *   keyHeight = (100% - 6 * 3px) / 7
     *   gap = 3px
     */
    const BLACK_KEYS = [
        { semitone: 10, whiteKeyAbove: 0 },
        { semitone: 8, whiteKeyAbove: 1 },
        { semitone: 6, whiteKeyAbove: 2 },
        { semitone: 3, whiteKeyAbove: 4 },
        { semitone: 1, whiteKeyAbove: 5 },
    ] as const;

    const BLACK_KEY_HEIGHT = 23;

    /** White key semitone indices, top-to-bottom: B, A, G, F, E, D, C */
    const WHITE_KEY_SEMITONES = [11, 9, 7, 5, 4, 2, 0] as const;
</script>

<PlayControls {paused} />

<div class="container">
    <SongCard title={score.name}>
        <img src={score.image} alt={score.name} />
    </SongCard>

    <div class="piano-keys">
        <div class="white-keys">
            {#each WHITE_KEY_SEMITONES as semitone}
                <div
                    class="white-key"
                    class:active={activeNote?.pitch != null &&
                        pitchToSemitone(activeNote.pitch) === semitone}
                ></div>
            {/each}
        </div>
        <div class="black-keys-layer">
            {#each BLACK_KEYS as { semitone, whiteKeyAbove }}
                {@const wk = whiteKeyAbove}
                <div
                    class="black-key"
                    class:active={activeNote?.pitch != null &&
                        pitchToSemitone(activeNote.pitch) === semitone}
                    style:top={`calc(${wk + 1} * (100% - 18px) / 7 + ${wk} * 3px + 1.5px - ${BLACK_KEY_HEIGHT / 2}px)`}
                    style:height={`${BLACK_KEY_HEIGHT}px`}
                ></div>
            {/each}
        </div>
    </div>

    <div class="piano-roll">
        {#each segmentRanges as range, segIdx}
            {@const segMeasures = Math.floor(range.beats / 4)}
            {@const notes = segmentNotes[segIdx]}
            {@const inSegment =
                currentBeat >= range.start &&
                currentBeat < range.start + range.beats}
            <div
                class="segment"
                class:dimmed={activeSegment !== -1 && segIdx !== activeSegment}
                style:flex={range.beats}
            >
                <div class="rows">
                    {#each Array(totalSemis) as _, i}
                        <div
                            class="row"
                            class:row-even={i % 2 === 0}
                            class:row-odd={i % 2 !== 0}
                        ></div>
                    {/each}
                </div>

                <div class="grid-lines">
                    {#each Array(segMeasures) as _, i}
                        <div
                            class="measure-line"
                            style:left={`${(((i + 1) * 4) / range.beats) * 100}%`}
                        ></div>
                    {/each}
                </div>

                <div class="note-bars">
                    {#each notes as note}
                        <div
                            class="note-bar"
                            class:rest={note.rest}
                            class:active={activeNote === note}
                            style:left={`${((note.start - range.start) / range.beats) * 100}%`}
                            style:width={`${(note.duration / range.beats) * 100}%`}
                            style:top={`${((score.trackRange[1] - (note.pitch ?? score.trackRange[0])) / totalSemis) * 100}%`}
                            style:height={`${(1 / totalSemis) * 100}%`}
                        >
                            {note.text}
                        </div>
                    {/each}
                </div>

                {#if inSegment}
                    <div
                        class="play-line"
                        style:left={`${((currentBeat - range.start) / range.beats) * 100}%`}
                    ></div>
                {/if}
            </div>
        {/each}
    </div>
</div>

<style>
    .container {
        display: flex;
        align-items: stretch;
        gap: 10px;
        min-height: 235px;
        margin-top: 20px;
    }

    .piano-keys {
        position: relative;
        width: 105px;
        flex-shrink: 0;
    }

    .white-keys {
        display: flex;
        flex-direction: column;
        gap: 3px;
        height: 100%;
    }

    .white-key {
        flex: 1 0 0;
        min-height: 1px;
        background: var(--track-background);
        border-radius: 0 5px 5px 0;
        transition: background 0.15s ease;
    }

    .white-key.active {
        background: var(--blue-primary);
    }

    .black-keys-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 50%;
        height: 100%;
        pointer-events: none;
    }

    .black-key {
        position: absolute;
        left: 0;
        width: 100%;
        background: var(--black-900);
        border-radius: 0 3px 3px 0;
        transition: background 0.15s ease;
    }

    .black-key.active {
        background: var(--blue-primary);
    }

    .piano-roll {
        display: flex;
        gap: 4px;
        flex-grow: 1;
        overflow: hidden;
    }

    .segment {
        position: relative;
        flex-shrink: 0;
        overflow: hidden;
        transition: opacity 0.15s ease;
    }

    .segment.dimmed {
        opacity: 0.3;
    }

    .rows {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .row {
        flex: 1 0 0;
        min-height: 1px;
    }

    .row-even {
        background: var(--track-background);
    }

    .row-odd {
        background: rgba(239, 237, 233, 0.2);
    }

    .grid-lines {
        position: absolute;
        inset: 0;
        pointer-events: none;
    }

    .measure-line {
        position: absolute;
        top: 0;
        height: 100%;
        width: 2px;
        background: var(--black-700);
    }

    .note-bars {
        position: absolute;
        inset: 0;
        pointer-events: none;
    }

    .note-bar {
        position: absolute;
        background: var(--black-700);
        border-radius: 2px;
        transition: background 0.15s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
    }

    .note-bar.active {
        background: var(--blue-primary);
    }

    .note-bar.rest {
        color: var(--black-700);
        background: transparent;
    }

    .play-line {
        position: absolute;
        top: -4px;
        bottom: -4px;
        width: 5px;
        background: var(--blue-primary);
        border-radius: 3px;
        will-change: left;
        filter: drop-shadow(2px 0 4px rgba(0, 0, 0, 0.25));
    }
</style>
