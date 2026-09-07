import { sectionBlocks } from './content'
import { rewrapSection } from './pretext'
import {
  illustrations,
  INITIAL_MOBILE_LAYOUT,
  MOBILE_BREAKPOINT,
  type IndexedSpec,
} from './illustrations'

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

  const anchors = [
    ...document.querySelectorAll<HTMLElement>(
      'div.ddd-anchor[data-section][data-type]',
    ),
  ]
  await Promise.all(
    [...groupByTarget(illustrations)].map(async ([section, specs]) => {
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
        return
      }

      const blocks = sectionBlocks(start, end)
      if (blocks.length) await rewrapSection(section, blocks, specs)
    }),
  )
}

void main()
