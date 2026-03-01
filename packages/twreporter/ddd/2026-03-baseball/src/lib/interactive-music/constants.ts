import type { GraphicConfig } from "../layout/types";

export type TrackConfig = {
  name: string;
  src: string;
  tracks: {
    name: string;
    notes: { length: number; rest?: boolean; text?: string }[];
  }[];
};

export type TrackStates = Record<"default" | "alternative", TrackConfig>;

export const keys: Record<
  string,
  GraphicConfig & {
    songTitle: string;
    endingPadding: number;
    repeatPadding: number;
    states: TrackStates;
  }
> = {
  A02: {
    title: "利用節奏轉折點提示球迷、舞者的動作",
    subtitle: "〈統一尚勇〉節錄",
    songTitle: "統一尚勇",
    endingPadding: 0,
    repeatPadding: 0,
    states: {
      default: {
        name: "原曲",
        src: "https://projects.twreporter.org/twreporter/ddd/2026-03-baseball/audios/A02/01.mp3",
        tracks: [
          {
            name: "口號",
            notes: [
              { length: 4, rest: true },
              { length: 2, text: "He" },
              { length: 2, text: "ro" },
              { length: 4, rest: true },
              { length: 2, text: "Hi" },
              { length: 2, text: "to" },
            ],
          },
          {
            name: "大鼓",
            notes: [
              { length: 2 },
              { length: 1 },
              { length: 1 },
              { length: 4, rest: true },
              { length: 2 },
              { length: 1 },
              { length: 1 },
              { length: 4, rest: true },
            ],
          },
          {
            name: "BASS",
            notes: [
              { length: 2 },
              { length: 1 },
              { length: 1 },
              { length: 4, rest: true },
              { length: 2 },
              { length: 1 },
              { length: 1 },
              { length: 4, rest: true },
            ],
          },
        ],
      },
      alternative: {
        name: "去除反拍",
        src: "https://projects.twreporter.org/twreporter/ddd/2026-03-baseball/audios/A02/02.mp3",
        tracks: [
          {
            name: "口號",
            notes: [
              { length: 4, rest: true },
              { length: 2, text: "He" },
              { length: 2, text: "ro" },
              { length: 4, rest: true },
              { length: 2, text: "Hi" },
              { length: 2, text: "to" },
            ],
          },
          {
            name: "大鼓",
            notes: [
              { length: 2 },
              { length: 2 },
              { length: 4, rest: true },
              { length: 2 },
              { length: 2 },
              { length: 4, rest: true },
            ],
          },
          {
            name: "BASS",
            notes: [
              { length: 2 },
              { length: 2 },
              { length: 4, rest: true },
              { length: 2 },
              { length: 2 },
              { length: 4, rest: true },
            ],
          },
        ],
      },
    },
  },
  A04: {
    title: "利用反拍設計，在音樂上帶給球迷跳躍感",
    subtitle: "〈氣蓋山河〉節錄",
    songTitle: "氣蓋山河",
    endingPadding: 3,
    repeatPadding: 0.5,
    states: {
      default: {
        name: "原曲",
        src: "https://projects.twreporter.org/twreporter/ddd/2026-03-baseball/audios/A04/01.mp3",
        tracks: [
          {
            name: "口號",
            notes: [
              { length: 1, text: "台" },
              { length: 1, text: "鋼" },
              { length: 1, text: "雄" },
              { length: 1, text: "鷹" },
              { length: 2, text: "安" },
              { length: 2, text: "打" },

              { length: 1, text: "台" },
              { length: 1, text: "鋼" },
              { length: 1, text: "雄" },
              { length: 1, text: "鷹" },
              { length: 1, text: "全" },
              { length: 1, text: "壘" },
              { length: 2, text: "打" },
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
      alternative: {
        name: "去除反拍",
        src: "https://projects.twreporter.org/twreporter/ddd/2026-03-baseball/audios/A04/02.mp3",
        tracks: [
          {
            name: "口號",
            notes: [
              { length: 1, text: "台" },
              { length: 1, text: "鋼" },
              { length: 1, text: "雄" },
              { length: 1, text: "鷹" },
              { length: 2, text: "安" },
              { length: 2, text: "打" },

              { length: 1, text: "台" },
              { length: 1, text: "鋼" },
              { length: 1, text: "雄" },
              { length: 1, text: "鷹" },
              { length: 1, text: "全" },
              { length: 1, text: "壘" },
              { length: 2, text: "打" },
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
    },
  },
};
