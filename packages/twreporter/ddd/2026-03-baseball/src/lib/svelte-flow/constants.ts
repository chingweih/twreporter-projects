export function headerId({ colIdx }: { colIdx: number }) {
  return `c${colIdx + 1}-header`;
}

export function itemId({
  colIdx,
  itemIdx,
}: {
  colIdx: number;
  itemIdx: number;
}) {
  return `c${colIdx + 1}-${itemIdx + 1}`;
}

export const COL_GAP = 250;
export const ROW_GAP = 100;

export const columns: { header: string; items: string[] }[] = [
  {
    header: "本土民謠",
    items: ["高山青", "燒肉粽", "丟丟銅仔", "Lamigo《客家本色》"],
  },
  {
    header: "台語/華語流行",
    items: [
      "統一獅一堆",
      "彭政閔《愛情的恰恰》",
      "周思齊《牛仔很忙》",
      "高國輝《紅蜻蜓》",
      "林智平《山頂黑狗兄》",
    ],
  },
  {
    header: "影視音樂",
    items: [
      "陳金鋒 布袋戲音樂",
      "林安可《英雄本色》",
      "吉力吉撈（牛仔電影＋武俠劇配樂）",
      "林承飛《馬蓋先》",
    ],
  },
  {
    header: "救國團康樂歌",
    items: [
      "拜火歌",
      "團結團結就是力量（The Battle Hymn of the Republic）",
      "羅大佑《黃色臉孔》",
      "統一獅《吞霸歌》",
    ],
  },
  {
    header: "管樂進行曲",
    items: ["張育成", "布雷", "兄弟象《戰歌》"],
  },
  {
    header: "世界音樂",
    items: [
      "王老先生有塊地（Old MacDonald Had a Farm）",
      "台鋼雄鷹《氣蓋山河》印度舞曲",
      "統一獅《登峰造極》俄羅斯舞曲",
      "潘傑凱（carnaval de paris）法國電音",
    ],
  },
  {
    header: "西方流行",
    items: [
      "味全龍《銳不可擋》",
      "兄弟象《黃潮降臨》",
      "梁家榮《smoke on the water》",
      "許基宏《看上他》",
    ],
  },
  {
    header: "韓式流行",
    items: ["陳晨威·朴玄彬《빠라빠빠》", "桃猿《勝利飛船》"],
  },
  {
    header: "日式流行",
    items: [
      "林立《洛克人2》",
      "戴培峰《小魔女doremi》",
      "高志綱《七龍珠》",
      "富邦《藍色狂潮》頭文字D",
    ],
  },
];
