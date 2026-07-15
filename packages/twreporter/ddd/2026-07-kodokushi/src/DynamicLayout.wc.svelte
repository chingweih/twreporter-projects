<svelte:options customElement={{ tag: 'twreporter-kodokushi' }} />

<script>
  import { onMount } from 'svelte'
  import css from './lib/style.css?inline'
  import {
    layoutNextLineRange,
    materializeLineRange,
    prepareWithSegments,
  } from '@chenglou/pretext'
  import { story } from './lib/content.js'
  import { subtractIntervals } from './lib/layout.js'

  const BASE_WIDTH = 580
  const FONT = '400 16px "Noto Sans TC", sans-serif'
  const LINE_HEIGHT = 28
  const PARAGRAPH_GAP = 20
  const ALPHA_THRESHOLD = 32
  const IMAGE_PADDING = 20

  let article = $state()
  let width = $state(0)
  let masks = $state([])

  const flow = $derived(width ? buildFlow(width, masks) : { images: [], paragraphs: [], height: 0 })

  onMount(async () => {
    const observer = new ResizeObserver(([entry]) => {
      width = Math.min(entry.contentRect.width, BASE_WIDTH)
    })
    observer.observe(article)

    await document.fonts?.ready
    masks = await Promise.all(story.images.map(createMask))

    return () => observer.disconnect()
  })

  async function createMask(spec) {
    const source = await new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = reject
      image.src = spec.src
    })
    const sampleWidth = 480
    const sampleHeight = Math.round((source.height / source.width) * sampleWidth)
    const canvas = document.createElement('canvas')
    canvas.width = sampleWidth
    canvas.height = sampleHeight
    const context = canvas.getContext('2d', { willReadFrequently: true })
    context.drawImage(source, 0, 0, sampleWidth, sampleHeight)

    return { ...spec, pixels: context.getImageData(0, 0, sampleWidth, sampleHeight).data, sampleWidth, sampleHeight }
  }

  function buildFlow(contentWidth, availableMasks) {
    const scale = contentWidth / BASE_WIDTH
    const images = []
    const paragraphs = []
    let y = 0

    for (const [index, text] of story.paragraphs.entries()) {
      for (const mask of availableMasks.filter((item) => item.anchor === index)) {
        images.push({
          ...mask,
          x: mask.x * scale,
          y: y + mask.top * scale,
          width: mask.width * scale,
        })
      }

      const prepared = prepareWithSegments(text, FONT)
      const lines = []
      let cursor = { segmentIndex: 0, graphemeIndex: 0 }
      const top = y

      while (true) {
        const segments = availableSegments(contentWidth, y, images)
        let rendered = false
        for (const [x, segmentWidth] of segments) {
          const range = layoutNextLineRange(prepared, cursor, segmentWidth)
          if (!range) break
          lines.push({ text: materializeLineRange(prepared, range).text, x, y: y - top })
          cursor = range.end
          rendered = true
        }
        if (!rendered) break
        y += LINE_HEIGHT
      }

      paragraphs.push({ index, top, height: y - top, lines })
      y += PARAGRAPH_GAP
    }

    return { images, paragraphs, height: y }
  }

  function availableSegments(contentWidth, y, images) {
    const blocked = images.flatMap((image) =>
      [y + 3, y + LINE_HEIGHT / 2, y + LINE_HEIGHT - 3].flatMap((row) => imageIntervals(image, row)),
    )
    return subtractIntervals(contentWidth, blocked)
  }

  function imageIntervals(image, y) {
    const pixelScale = image.width / image.sampleWidth
    const row = Math.floor((y - image.y) / pixelScale)
    if (row < 0 || row >= image.sampleHeight) return []

    const intervals = []
    let start = null
    for (let column = 0; column < image.sampleWidth; column += 1) {
      const alpha = image.pixels[(row * image.sampleWidth + column) * 4 + 3]
      if (alpha > ALPHA_THRESHOLD && start === null) start = column
      if ((alpha <= ALPHA_THRESHOLD || column === image.sampleWidth - 1) && start !== null) {
        const end = alpha > ALPHA_THRESHOLD ? column + 1 : column
        intervals.push([
          image.x + start * pixelScale - IMAGE_PADDING,
          image.x + end * pixelScale + IMAGE_PADDING,
        ])
        start = null
      }
    }
    return intervals
  }
</script>

{@html `<style>${css}</style>`}

<article bind:this={article}>
  <figure class="hero">
    <img src={story.hero} alt="往生者家中與門外里長的俯視插畫" />
  </figure>

  <header>
    <h1>{story.title}</h1>
    <p>{story.intro}</p>
  </header>

  <section aria-labelledby="chief-title">
    <h2 id="chief-title">{story.sectionTitle}</h2>
    <div class="flow" style={`height: ${flow.height}px`}>
      {#each flow.paragraphs as paragraph}
        {#each flow.images.filter((image) => image.anchor === paragraph.index) as image}
          <img
            class="illustration"
            src={image.src}
            alt={image.alt}
            style={`left: ${image.x}px; top: ${image.y}px; width: ${image.width}px`}
          />
        {/each}
        <p class="paragraph" style={`top: ${paragraph.top}px; height: ${paragraph.height}px`}>
          {#each paragraph.lines as line}
            <span style={`left: ${line.x}px; top: ${line.y}px`}>{line.text}</span>
          {/each}
        </p>
      {/each}
    </div>
  </section>
</article>
