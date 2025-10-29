import archieml from 'archieml'

export function getDoc() {
  return `[tiles]
* mataian
[]

[cards]

name: start
[.contents]
* 花蓮馬太鞍溪上游的堰塞湖9月23日下午2時50分溢流潰壩，30分鐘內傾洩出1,540萬噸的湖水，將近6,000個奧運標準游泳池的水量，洪流夾帶泥沙滾滾而下，將台9線的馬太鞍溪橋沖斷，並沖破光復市區北邊的堤防、灌進市區。災情慘重的佛祖街，掩蓋而至的黑泥竟達2米高。
[]
camera: (-3360976.3915810646, 5626349.767166913, 2856822.0436862125)|6.283185307179586;-1.5705883482332212;0

name: 1
[.contents]
* 溢流31小時前，林保署發布紅色警戒要求撤離，消防署建議的「依親」、「至避難所」與「高處垂直避難（爬上建物二樓以上高處）」仍造成傷亡。《報導者》取得內政部災害應變系統中的罹難者通報資料，多數罹難者是年長者，發現時是在一樓屋內溺水死亡。
* 我們再將罹難者所在的住址透過地理資訊系統（GIS），套疊農業部林業及自然保育署花蓮分署建議優先撤離範圍、花蓮縣政府宣布的撤離範圍等圖資後，確認26日中午前已知的14名罹難者身亡地點，都在撤離範圍內。連應該設在安全地點的救災人力集結點（光復鄉公所）與撤離收容所（光復商工），事實上也在撤離範圍，最後竟受泥流包圍，可見縣政府選址之輕忽。
[]
camera: (-3039175.087422182, 4996312.073184709, 2543932.7584650647)|6.168121781137316;-0.17456522896790871;6.283073523882281

name: 2
[.contents]
* 根據中央災害應變中心統計，這次撤離的人數超過8,000人；內政部26日回覆《報導者》詢問，確認是單一鄉鎮市的疏散撤離人數新高。在多個撤離模型中，內政部採納台灣大學評估的模型，擴大撤離範圍；透過最新的衛星遙測圖，也顯示淹水區域與撤離範圍吻合。面對全球氣候變遷及極端氣候的多變與威脅，防災韌性不該只是紙上談兵，我們是否能做得更好？
[]
camera: (-3054615.1527952724, 4986321.1583602065, 2544724.185047104)|5.106004113836832;-0.2172414487961194;6.282512059884984

name: 3
[.contents]
* 9月25日早上，花蓮縣光復鄉連續數日的大雨終於停了。不到7點，強烈的陽光照在汙泥上，騰蒸而上的水氣更讓人感到悶熱；連日積水的泥濘看似逐漸變乾，空氣中飄散著白色粉塵。許多居民回到佛祖街，想要徒步返家查看情況，然而表面乾燥的泥地下方仍是深軟的淤泥，雨鞋一踩下，就陷入泥濘，深達膝蓋，得有人在旁協助，使力轉轉腳踝、把泥濘轉鬆才有辦法脫身。
[]
camera: (-3048301.9047382483, 4988369.717142027, 2545037.9756345837)|6.096391303045276;-0.7933023528400351;0.00000452428922415038

[]

[]

[]
`
}

export type Content = {
  tiles: string[]
  cards: {
    name: string
    camera: string
    contents: string[]
  }[]
}

export function getContent() {
  const doc = getDoc()

  return archieml.load<Content>(doc)
}

export function getCard({
  content,
  name,
}: {
  content: Content
  name: string | null
}) {
  if (!name) {
    return null
  }

  return content.cards.find((card) => card.name === name)
}

export function parseCamera(camera: string) {
  const [position, orientation] = camera.split('|')
  const positionValues = position
    .replace('(', '')
    .replace(')', '')
    .split(',')
    .map((v) => parseFloat(v.trim()))
  const orientationValues = orientation
    .split(';')
    .map((v) => parseFloat(v.trim()))
  return {
    position: {
      x: positionValues[0],
      y: positionValues[1],
      z: positionValues[2],
    },
    orientation: {
      heading: orientationValues[0],
      pitch: orientationValues[1],
      roll: orientationValues[2],
    },
  }
}
