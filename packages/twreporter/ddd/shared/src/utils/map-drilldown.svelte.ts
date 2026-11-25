import type { GeoPermissibleObjects } from 'd3-geo'
import { tick } from 'svelte'
import type { MapTooltipTarget } from '../components/shared/D3Map.svelte'

type Selection = {
  key: string
  trigger: SVGPathElement
  map: SVGSVGElement | null
}

export class MapDrilldown<Region extends GeoPermissibleObjects> {
  #selections = $state.raw<readonly Selection[]>([])
  #findRegion: (key: string) => Region | undefined

  tooltipTarget = $state.raw<MapTooltipTarget>()
  backButton = $state<HTMLButtonElement>()

  constructor(findRegion: (key: string) => Region | undefined) {
    this.#findRegion = findRegion
  }

  get path(): readonly string[] {
    return this.#selections.map(({ key }) => key)
  }

  get selectedKey() {
    return this.#selections.at(-1)?.key
  }

  get focus() {
    const key = this.selectedKey
    return key === undefined ? undefined : this.#findRegion(key)
  }

  async select(key: string, trigger: SVGPathElement, parentKey?: string) {
    if (key === this.selectedKey || !this.#findRegion(key)) return
    const parentIndex = this.#selections.findIndex(
      (selection) => selection.key === parentKey,
    )
    if (parentKey !== undefined && parentIndex < 0) return

    const selections = [
      ...this.#selections.slice(0, parentIndex + 1),
      { key, trigger, map: trigger.ownerSVGElement },
    ]
    this.tooltipTarget = undefined
    this.#selections = selections
    await tick()
    if (this.#selections === selections) {
      this.backButton?.focus({ preventScroll: true })
    }
  }

  back() {
    return this.#returnTo(this.#selections.length - 1)
  }

  reset() {
    return this.#returnTo(0)
  }

  async #returnTo(depth: number) {
    const selection = this.#selections[depth]
    if (!selection) return
    const selections = this.#selections.slice(0, depth)
    this.tooltipTarget = undefined
    this.#selections = selections
    await tick()
    if (this.#selections !== selections) return

    const trigger = selection.trigger.isConnected
      ? selection.trigger
      : selection.map?.querySelector<SVGPathElement>(
          `[data-map-region="${CSS.escape(selection.key)}"]`,
        )
    trigger?.focus({ preventScroll: true })
  }
}
