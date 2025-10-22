export const timeline = [
  {
    id: 'start',
    y: 0,
    position: [-3390489.085868616, 5722974.472209858, 2876048.2886838666],
    heading: 6.283185307179583,
    pitch: -1.5707319103004465,
    roll: 0,
  },
  {
    id: '動畫點1',
    y: 1000,
    position: [-3040638.296382523, 5002281.974470028, 2549374.7812687275],
    heading: 0.06647429208791866,
    pitch: -1.111343054122088,
    roll: 6.225466906458315,
  },
  {
    id: '動畫點2',
    y: 2000,
    position: [-3049717.900080498, 4988100.1049922025, 2546587.629861226],
    heading: 5.027909492380209,
    pitch: -0.35869794651724973,
    roll: 0.0000265757762845098,
  },
  {
    id: '動畫點3',
    y: 3000,
    position: [-3051318.7328699175, 4986378.862446854, 2545448.2741017607],
    heading: 4.831963249241495,
    pitch: -0.4082805206324416,
    roll: 0.00034304171266885675,
  },
  {
    id: 'end',
    y: 4000,
    position: [-3055361.616197735, 4997127.994269153, 2551474.9326147796],
    heading: 4.85601248803264,
    pitch: -1.545147439896669,
    roll: 0,
  },
]

export function getTimeline(y: number) {
  const sortedTimeline = timeline.sort((a, b) => a.y - b.y)

  if (y <= sortedTimeline[0].y) {
    return sortedTimeline[0]
  }
  if (y >= sortedTimeline[timeline.length - 1].y) {
    return sortedTimeline[timeline.length - 1]
  }
  for (let i = 0; i < sortedTimeline.length - 1; i++) {
    const current = sortedTimeline[i]
    const next = sortedTimeline[i + 1]
    if (y >= current.y && y <= next.y) {
      return current
    }
  }

  return null
}

export function getTimelineById(id: string | null) {
  return timeline.find((i) => i.id === id)
}
