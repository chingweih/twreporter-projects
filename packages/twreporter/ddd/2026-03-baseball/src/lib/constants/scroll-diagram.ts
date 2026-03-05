export type NodeMeta = {
  id: string;
  label: string;
  team?: string;
  song?: string;
  genre?: string;
  description?: string;
};

export type PathType = "direct" | "overview";

export type ScrollStep = {
  to: string;
  path: PathType;
  scale?: number;
  text?: string;
  audio?: string;
};

export const nodes: NodeMeta[] = [
  {
    id: "node__1-1",
    label: "藍調音樂",
    genre: "藍調",
    description:
      "美國「藍調音樂」身為現代流行樂種的根源，自然也是棒球應援曲的重要支派。",
  },
  {
    id: "node__1-1-1",
    label: "蔣少宏",
    song: "氣勢如虹",
    genre: "藍調",
  },
  {
    id: "node__1-1-2",
    label: "吉力吉撈．鞏冠",
    song: "西部牛仔",
    genre: "藍調",
  },
  {
    id: "node__1-1-3",
    label: "陳金鋒",
    team: "中信兄弟",
    song: "紅不讓",
    genre: "藍調",
  },
];

export const steps: ScrollStep[] = [
  {
    to: "node__1-b-1",
    path: "direct",
    scale: 1,
    text: "從吉力吉撈・鞏冠的「西部牛仔」風到大師兄林智勝《少林足球》主題曲、林立《洛克人2》電玩配樂，影視與動漫、電玩一直是台灣應援曲的靈感來源大宗。",
  },
  {
    to: "node__1",
    path: "direct",
    scale: 0.5,
  },
  {
    to: "node__2",
    path: "direct",
    scale: 0.5,
  },
  {
    to: "node__2",
    path: "overview",
    scale: 2,
    text: "其實台灣應援曲中，不只有本土元素，還藏著世界各文化圈獨有的音色、節奏、音程結構。",
  },
  {
    to: "node__3",
    path: "direct",
    scale: 0.5,
  },
  {
    to: "node__3",
    path: "direct",
    scale: 2.5,
    text: "進一步以「樂種」進行分類，台灣重砲手們，以及歷史悠久的中信兄弟，依然保持著從古典樂延伸的進行曲、軍歌風格。",
  },
  {
    to: "node__4",
    path: "direct",
    scale: 0.5,
  },
  {
    to: "node__4",
    path: "direct",
    scale: 2.5,
    text: "構成台灣應援曲的一大根基，還有職棒早期大量由歐美民謠、童謠改編的「傳統應援」。",
  },
  {
    to: "node__6",
    path: "direct",
    scale: 0.5,
  },
  {
    to: "node__5",
    path: "direct",
    scale: 0.5,
  },
  {
    to: "node__5",
    path: "overview",
    scale: 1,
    text: "美國「藍調音樂」身為現代流行樂種的根源，自然也是棒球應援曲的重要支派，尤其在台灣進入「現代應援」時期後，大量以電吉他編曲的音樂，成為當代棒球場的核心聲響。",
  },
  {
    to: "node__6-a",
    path: "direct",
    scale: 0.5,
  },
  {
    to: "node__6-a",
    path: "direct",
    scale: 1.5,
    text: "近年球場硬體設備提升，應援又有舞蹈需求，以電子樂構成主旋律，融合電吉他、爵士鼓加強熱血感的樂曲也開始出現。",
  },
  {
    to: "node__6-b",
    path: "direct",
    scale: 0.5,
  },
  {
    to: "node__6-b-i",
    path: "direct",
    scale: 0.5,
  },
  {
    to: "node__6-b-i-1",
    path: "direct",
    scale: 0.5,
  },
];
