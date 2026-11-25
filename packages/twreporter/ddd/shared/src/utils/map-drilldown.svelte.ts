import type { GeoPermissibleObjects } from 'd3-geo'
import { tick } from 'svelte'
import type { MapTooltipTarget } from '../components/shared/D3Map.svelte'

export class MapDrilldown<Region extends GeoPermissibleObjects> {
  #selection = $state.raw<{ key: string; trigger: SVGPathElement }>()
  #findRegion: (key: string) => Region | undefined

  tooltipTarget = $state.raw<MapTooltipTarget>()
  backButton = $state<HTMLButtonElement>()

  constructor(findRegion: (key: string) => Region | undefined) {
    this.#findRegion = findRegion
  }

  get selectedKey() {
    return this.#selection?.key
  }

  get focus() {
    return this.#selection && this.#findRegion(this.#selection.key)
  }

  async select(key: string, trigger: SVGPathElement) {
    if (key === this.selectedKey || !this.#findRegion(key)) return
    const selection = { key, trigger }
    this.tooltipTarget = undefined
    this.#selection = selection
    await tick()
    if (this.#selection === selection) {
      this.backButton?.focus({ preventScroll: true })
    }
  }

  async reset() {
    const selection = this.#selection
    this.tooltipTarget = undefined
    this.#selection = undefined
    await tick()
    if (!this.#selection) selection?.trigger.focus({ preventScroll: true })
  }
}
