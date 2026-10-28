import type { PlayerTrack } from '../rpc.ts'

export const trackColors = {
  road: '#d73027',
  shoulder: '#ed8b23',
  safe: '#2f8f4e',
} satisfies Record<PlayerTrack[number]['kind'], string>
