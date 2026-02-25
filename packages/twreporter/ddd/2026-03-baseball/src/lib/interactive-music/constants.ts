export type TrackConfig = {
  src: string;
  tracks: {
    name: string;
    notes: { length: number; rest?: boolean }[];
  }[];
};

export const tracks = {
  default: {
    src: "https://projects.twreporter.org/twreporter/ddd/2026-03-baseball/audios/tsg/01.mp3",
    tracks: [
      {
        name: "口號",
        notes: [
          { length: 1 },
          { length: 1 },
          { length: 1 },
          { length: 1 },
          { length: 2 },
          { length: 2 },

          { length: 1 },
          { length: 1 },
          { length: 1 },
          { length: 1 },
          { length: 1 },
          { length: 1 },
          { length: 2 },
        ],
      },
      {
        name: "主旋律",
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
        name: "BASS",
        notes: [
          { length: 1, rest: true },
          { length: 2 },
          { length: 1 },
          { length: 2 },
          { length: 2 },

          { length: 1, rest: true },
          { length: 2 },
          { length: 1 },
          { length: 1 },
          { length: 1 },
          { length: 2 },
        ],
      },
    ],
  },
  notSwing: {
    src: "https://projects.twreporter.org/twreporter/ddd/2026-03-baseball/audios/tsg/02.mp3",
    tracks: [
      {
        name: "口號",
        notes: [
          { length: 1 },
          { length: 1 },
          { length: 1 },
          { length: 1 },
          { length: 2 },
          { length: 2 },

          { length: 1 },
          { length: 1 },
          { length: 1 },
          { length: 1 },
          { length: 1 },
          { length: 1 },
          { length: 2 },
        ],
      },
      {
        name: "主旋律",
        notes: [
          { length: 2 },
          { length: 2 },
          { length: 1 },
          { length: 1 },
          { length: 1 },

          { length: 2 },
          { length: 2 },
          { length: 1 },
          { length: 1 },
          { length: 1 },
        ],
      },
      {
        name: "BASS",
        notes: [
          { length: 2 },
          { length: 2 },
          { length: 2 },
          { length: 2 },

          { length: 2 },
          { length: 2 },
          { length: 2 },
          { length: 2 },
        ],
      },
    ],
  },
} satisfies Record<string, TrackConfig>;
