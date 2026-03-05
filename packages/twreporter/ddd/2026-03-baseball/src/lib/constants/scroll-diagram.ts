export type NodeMeta = {
  id: string;
  label: string;
  youtube?: string;
};

export type NodeBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
};

export type PathType = "direct" | "overview";

export type ScrollStep = {
  to: string;
  path: PathType;
  scale?: number;
  text?: string;
  audios?: { src: string; name: string }[];
};

export const nodes: NodeMeta[] = [
  // ── 1. 影視配樂 ──
  { id: "node__1", label: "影視配樂" },
  { id: "node__1-a", label: "布袋戲" },
  { id: "node__1-a-1", label: "陳金鋒" },
  { id: "node__1-a-2", label: "蔣少宏" },
  { id: "node__1-b", label: "動作電影" },
  { id: "node__1-b-1", label: "吉力吉撈・鞏冠" },
  { id: "node__1-b-2", label: "林安可" },
  { id: "node__1-b-3", label: "林智勝" },
  { id: "node__1-c", label: "日本動漫與電玩" },
  { id: "node__1-c-1", label: "林立" },
  { id: "node__1-c-2", label: "戴培峰" },
  { id: "node__1-c-3", label: "朱育賢" },
  { id: "node__1-c-4", label: "高志綱" },
  { id: "node__1-c-5", label: "葉君璋" },

  // ── 2. 現代流行樂 ──
  { id: "node__2", label: "現代流行樂" },
  { id: "node__2-a", label: "韓國流行" },
  { id: "node__2-a-1", label: "陳晨威" },
  { id: "node__2-a-2", label: "樂天桃猿〈勝利飛船〉" },
  { id: "node__2-b", label: "日本流行" },
  { id: "node__2-b-1", label: "林子偉" },
  { id: "node__2-b-2", label: "吳念庭" },
  { id: "node__2-b-3", label: "張政禹" },
  { id: "node__2-b-4", label: "高國輝" },
  { id: "node__2-c", label: "華語流行" },
  { id: "node__2-c-1", label: "李凱威" },
  { id: "node__2-c-2", label: "林佳緯" },
  { id: "node__2-c-3", label: "彭政閔（B段）" },
  { id: "node__2-c-4", label: "周思齊" },

  // ── 3. 世界音樂 ──
  { id: "node__3", label: "世界音樂" },
  { id: "node__3-a", label: "台灣民謠、民俗音樂" },
  { id: "node__3-a-1", label: "丟丟銅仔" },
  { id: "node__3-a-2", label: "燒肉粽" },
  { id: "node__3-a-3", label: "四季紅" },
  { id: "node__3-b", label: "拉丁" },
  { id: "node__3-b-1", label: "潘傑楷" },
  { id: "node__3-b-2", label: "李宗賢" },
  { id: "node__3-c", label: "印度" },
  { id: "node__3-c-1", label: "統一7-ELEVEn獅〈登峰造極〉" },
  { id: "node__3-c-2", label: "台鋼雄鷹〈氣蓋山河〉過門" },
  { id: "node__3-d", label: "俄羅斯" },
  { id: "node__3-d-1", label: "台鋼雄鷹〈氣蓋山河〉前奏" },

  // ── 4. 古典 ──
  { id: "node__4", label: "古典" },
  { id: "node__4-a", label: "進行曲" },
  { id: "node__4-a-1", label: "張育成" },
  { id: "node__4-a-2", label: "江坤宇" },
  { id: "node__4-a-3", label: "岳東華" },
  { id: "node__4-a-4", label: "高宇杰" },
  { id: "node__4-a-5", label: "中信兄弟〈戰歌〉" },
  { id: "node__4-a-6", label: "曾豪駒" },
  { id: "node__4-a-7", label: "彭政閔（A段）" },
  {
    id: "node__4-a-8",
    label: "布雷T.B（When Johnny Comes Marching Home）",
  },
  {
    id: "node__4-a-9",
    label: "團結團結就是力量（The Battle Hymn of the Republic）",
  },

  // ── 5. 鄉村 ──
  { id: "node__5", label: "鄉村" },
  { id: "node__5-1", label: "統一7-ELEVEn獅〈必勝吞霸歌〉" },
  { id: "node__5-2", label: "陳重羽" },
  { id: "node__5-a", label: "兒歌" },
  { id: "node__5-a-1", label: "大力水手（I'm Popeye the Sailor Man）" },
  {
    id: "node__5-a-2",
    label: "王老先生有塊地（Old MacDonald Had a Farm）",
  },
  {
    id: "node__5-a-3",
    label: "伊比呀呀（She'll Be Coming 'Round the Mountain）",
  },

  // ── 6. 藍調 ──
  { id: "node__6", label: "藍調" },
  {
    id: "node__6-a",
    label: "搖滾",
    youtube:
      "https://www.youtube.com/watch?v=rMbATaj7Il8&list=PLb15rbk6I4pP7uge-Rg8Y9nTut0Xj_AIE",
  },
  { id: "node__6-a-i", label: "硬式搖滾" },
  { id: "node__6-a-i-1", label: "中信兄弟〈黃潮降臨〉" },
  { id: "node__6-a-i-2", label: "味全龍〈Red不可擋〉" },
  { id: "node__6-a-i-3", label: "陳文杰" },
  { id: "node__6-a-i-4", label: "邱智呈" },
  { id: "node__6-a-i-5", label: "張建銘（富邦時期）" },
  { id: "node__6-a-i-6", label: "陳江和" },
  { id: "node__6-a-ii", label: "金屬" },
  { id: "node__6-a-ii-1", label: "王博玄" },
  { id: "node__6-a-ii-2", label: "味全龍〈遍地開花〉" },
  { id: "node__6-a-iii", label: "流行搖滾" },
  { id: "node__6-a-iii-1", label: "陳傑憲" },
  { id: "node__6-a-iii-2", label: "宋晟睿" },
  { id: "node__6-a-iii-3", label: "曾頌恩" },
  { id: "node__6-a-iii-4", label: "統一7-ELEVEn獅〈統一尚勇〉" },
  { id: "node__6-b", label: "放克" },
  { id: "node__6-b-i", label: "迪斯可" },
  { id: "node__6-b-i-1", label: "張建銘（興農時期）" },
  { id: "node__6-b-ii", label: "電子" },
  { id: "node__6-b-ii-1", label: "Eurobeat" },
  { id: "node__6-b-ii-1-1", label: "富邦悍將〈藍色狂潮〉" },
  { id: "node__6-b-ii-2", label: "Trance" },
  { id: "node__6-b-ii-2-1", label: "富邦悍將〈超強一擊〉" },
];

export const steps: ScrollStep[] = [
  // Section 1
  { to: "node__", path: "direct" },
  {
    to: "node__1-b-1",
    path: "direct",
    text: "從吉力吉撈・鞏冠的「西部牛仔」風到大師兄林智勝《少林足球》主題曲、林立《洛克人2》電玩配樂，影視與動漫、電玩一直是台灣應援曲的靈感來源大宗。",
    audios: [
      {
        src: "https://projects.twreporter.org/twreporter/ddd/2026-03-baseball/audios/D01/02.mp3",
        name: "統一獅「林安可」應援曲",
      },
    ],
    scale: 1,
  },
  { to: "node__2", path: "direct" },

  // Section 2
  {
    to: "node__3",
    path: "direct",
    text: "其實台灣應援曲中，不只有本土元素，還藏著世界各文化圈獨有的音色、節奏、音程結構。",
  },
  { to: "node__3", path: "direct", scale: 0.5 },
  { to: "node__4", path: "direct" },

  // Section 3
  {
    to: "node__4-a",
    path: "direct",
    text: "進一步以「樂種」進行分類，台灣重砲手們，以及歷史悠久的中信兄弟，依然保持著從古典樂延伸的進行曲、軍歌風格。",
    audios: [
      {
        src: "https://projects.twreporter.org/twreporter/ddd/2026-03-baseball/audios/D01/03.mp3",
        name: "中信兄弟「江坤宇」應援曲",
      },
    ],
  },

  // Section 4
  {
    to: "node__5",
    path: "direct",
    text: "構成台灣應援曲的一大根基，還有職棒早期大量由歐美民謠、童謠改編的「傳統應援」。",
  },

  // Section 5
  {
    to: "node__6",
    path: "direct",
    text: "美國「藍調音樂」身為現代流行樂種的根源，自然也是棒球應援曲的重要支派，尤其在台灣進入「現代應援」時期後，大量以電吉他編曲的音樂，成為當代棒球場的核心聲響。",
  },
  { to: "node__6", path: "direct" },
  { to: "node__6-b", path: "direct" },

  // Section 6
  {
    to: "node__6-b-i-1-a",
    path: "direct",
    text: "近年球場硬體設備提升，應援又有舞蹈需求，以電子樂構成主旋律，融合電吉他、爵士鼓加強熱血感的樂曲也開始出現。",
    audios: [
      {
        src: "https://projects.twreporter.org/twreporter/ddd/2026-03-baseball/audios/D01/04.mp3",
        name: "統一獅「陳傑憲」應援曲",
      },
    ],
  },
];
