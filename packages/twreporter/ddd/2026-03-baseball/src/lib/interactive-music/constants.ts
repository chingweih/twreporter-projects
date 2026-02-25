export type TrackConfig = {
  name: string;
  notes: { length: number; rest?: boolean }[];
}[];

export const tracks = {
  default: [
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
  notSwing: [
    {
      name: "Bass",
      notes: [
        { length: 1, rest: true },
        { length: 2 },
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
  ],
} satisfies Record<string, TrackConfig>;
