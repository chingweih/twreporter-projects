import type { GraphicConfig } from "../layout/types";

/**
 * Semitone index within a single octave (C to C').
 * 0=C, 1=C#, 2=D, 3=D#, 4=E, 5=F, 6=F#, 7=G, 8=G#, 9=A, 10=A#, 11=B, 12=C'
 */
export type Pitch = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type PianoNoteInput = {
  pitch: Pitch;
  duration: number;
  rest?: boolean;
};

export type PianoSegment = {
  notes: PianoNoteInput[];
};

export type PianoScoreConfig = {
  name: string;
  src: string;
  image: string;
  totalBeats: number;
  endingPadding: number;
  repeatPadding: number;
  segments: PianoSegment[];
};

export type PianoNote = {
  pitch: Pitch;
  start: number;
  duration: number;
  rest?: boolean;
  /** Index of the segment this note belongs to */
  segment: number;
};

export const TOTAL_SEMITONES = 13;

export const keys: Record<
  string,
  GraphicConfig & {
    scores: PianoScoreConfig[];
  }
> = {
  A01: {
    title: "國家隊版本〈台灣尚勇〉",
    subtitle: "前奏節錄",
    scores: [
      {
        name: "台灣尚勇",
        src: "https://storage.googleapis.com/projects.twreporter.org/twreporter/ddd/2026-03-baseball/audios/tsg/01.mp3",
        image:
          "https://storage.googleapis.com/data-reporter-infographics/dev/2026-03-baseball/assets/test.svg",
        totalBeats: 16,
        endingPadding: 3,
        repeatPadding: 0.5,
        segments: [
          {
            notes: [
              { pitch: 7, duration: 3 },
              { pitch: 4, duration: 1 },
              { pitch: 7, duration: 3 },
              { pitch: 9, duration: 1 },
            ],
          },
          {
            notes: [
              { pitch: 11, duration: 1, rest: true },
              { pitch: 4, duration: 1 },
              { pitch: 7, duration: 3 },
              { pitch: 9, duration: 1 },
              { pitch: 11, duration: 2 },
            ],
          },
        ],
      },
    ],
  },
  A03: {
    title: "棒球應援曲使用音階的急升帶動氣氛",
    subtitle: "台鋼雄鷹嗆司曲〈氣蓋山河〉",
    scores: [
      {
        name: "氣蓋山河",
        src: "https://storage.googleapis.com/projects.twreporter.org/twreporter/ddd/2026-03-baseball/audios/tsg/01.mp3",
        image:
          "https://storage.googleapis.com/data-reporter-infographics/dev/2026-03-baseball/assets/test.svg",
        totalBeats: 16,
        endingPadding: 3,
        repeatPadding: 0.5,
        segments: [
          {
            notes: [
              { pitch: 7, duration: 3 },
              { pitch: 4, duration: 1 },
              { pitch: 7, duration: 3 },
              { pitch: 9, duration: 1 },
            ],
          },
        ],
      },
    ],
  },
  A05: {
    title: "棒球應援曲利用短「樂句」呼應棒球場上節奏",
    subtitle: "Team Taiwan 與流行樂〈黃昏的故鄉〉對比",
    scores: [
      {
        name: "Team Taiwan",
        src: "https://storage.googleapis.com/projects.twreporter.org/twreporter/ddd/2026-03-baseball/audios/tsg/01.mp3",
        image:
          "https://storage.googleapis.com/data-reporter-infographics/dev/2026-03-baseball/assets/test.svg",
        totalBeats: 16,
        endingPadding: 3,
        repeatPadding: 0.5,
        segments: [
          {
            notes: [
              { pitch: 7, duration: 3 },
              { pitch: 4, duration: 1 },
              { pitch: 7, duration: 3 },
              { pitch: 9, duration: 1 },
            ],
          },
          {
            notes: [
              { pitch: 11, duration: 1, rest: true },
              { pitch: 4, duration: 1 },
              { pitch: 7, duration: 3 },
              { pitch: 9, duration: 1 },
              { pitch: 11, duration: 2 },
            ],
          },
        ],
      },
      {
        name: "黃昏的故鄉",
        src: "https://storage.googleapis.com/projects.twreporter.org/twreporter/ddd/2026-03-baseball/audios/tsg/02.mp3",
        image:
          "https://storage.googleapis.com/data-reporter-infographics/dev/2026-03-baseball/assets/test.svg",
        totalBeats: 16,
        endingPadding: 3,
        repeatPadding: 0.5,
        segments: [
          {
            notes: [
              { pitch: 5, duration: 2 },
              { pitch: 7, duration: 2 },
              { pitch: 9, duration: 2 },
              { pitch: 5, duration: 1, rest: true },
              { pitch: 7, duration: 1 },
            ],
          },
          {
            notes: [
              { pitch: 12, duration: 3 },
              { pitch: 9, duration: 1 },
              { pitch: 7, duration: 2 },
              { pitch: 5, duration: 2 },
            ],
          },
        ],
      },
    ],
  },
};
