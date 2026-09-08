import { sectionBlocks } from './content'
import { rewrapSection } from './pretext'
import { configSchema } from './config'
import { syncGraphic } from './graphic-sync'
import {
  config,
  configChanges,
  setConfig,
  getIllustrations,
  INITIAL_MOBILE_LAYOUT,
  MOBILE_BREAKPOINT,
  type IndexedSpec,
} from './illustrations'

declare global {
  interface Window {
    __twreporter_dynamic_layout_config?: string
  }
}

function groupByTarget(specs: IndexedSpec[]): Map<string, IndexedSpec[]> {
  const grouped = new Map<string, IndexedSpec[]>()
  for (const spec of specs) {
    const group = grouped.get(spec.target) ?? []
    group.push(spec)
    grouped.set(spec.target, group)
  }
  return grouped
}

async function main(): Promise<void> {
  // Ignore in CMS
  if (location.hostname === 'keystone-editor.twreporter.org') return

  window.addEventListener('resize', () => {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT
    if (isMobile !== INITIAL_MOBILE_LAYOUT) location.reload()
  })
  await document.fonts.ready

  let rendering = Promise.resolve()
  let cleanups: (() => void)[] = []
  const render = () => {
    rendering = rendering.then(async () => {
      for (const cleanup of cleanups) cleanup()
      cleanups = []
      const anchors = [
        ...document.querySelectorAll<HTMLElement>(
          'div.ddd-anchor[data-section][data-type]',
        ),
      ]
      for (const [section, specs] of groupByTarget(getIllustrations())) {
        const start = anchors.find(
          (anchor) =>
            anchor.dataset.section === section && anchor.dataset.type === 'start',
        )
        const end = anchors.find(
          (anchor) =>
            anchor.dataset.section === section && anchor.dataset.type === 'end',
        )
        if (!start || !end) {
          console.warn(`Missing ${section} start/end anchors`)
          continue
        }

        const blocks = sectionBlocks(start, end)
        if (!blocks.length) continue
        const cleanup = await rewrapSection(section, blocks, specs)
        if (cleanup) cleanups.push(cleanup)
      }
    }).catch(console.error)
    return rendering
  }
  const sync = syncGraphic((value) => {
    setConfig(value)
    void render()
  })
  configChanges.addEventListener('change', () => sync.update(config))
  const configUrl = window.__twreporter_dynamic_layout_config
  if (configUrl) {
    try {
      const response = await fetch(configUrl)
      if (!response.ok) throw new Error(`Config request failed: ${response.status}`)
      const value = configSchema.parse(await response.json())
      if (!sync.connected) setConfig(value)
    } catch (error) {
      console.error('[kodokushi] Could not load config.', error)
    }
  }
  await render()
}

void main()
