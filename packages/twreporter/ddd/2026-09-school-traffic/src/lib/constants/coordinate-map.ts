import { z } from 'zod'
import coordinateMapData from './coordinate-map.json' with { type: 'json' }
import type { PlayerTrack } from '../rpc.ts'

const vertexSchema = z.object({
  landmark: z.string(),
  x: z.number(),
  z: z.number(),
  u: z.number(),
  v: z.number(),
})
const coordinateMap = z
  .object({
    width: z.number().positive(),
    height: z.number().positive(),
    landmarks: z.array(vertexSchema),
    vertices: z.array(vertexSchema),
    sections: z.array(
      z.object({
        vertices: z.tuple([
          z.number().int().nonnegative(),
          z.number().int().nonnegative(),
          z.number().int().nonnegative(),
        ]),
        a: z.number(),
        b: z.number(),
        c: z.number(),
        d: z.number(),
        e: z.number(),
        f: z.number(),
      }),
    ),
  })
  .parse(coordinateMapData)

export const mapWidth = coordinateMap.width
export const mapHeight = coordinateMap.height
export const coordinateLandmarks = coordinateMap.landmarks

const sections = coordinateMap.sections.map((section) => {
  const [p, q, r] = section.vertices.map(
    (index) => coordinateMap.vertices[index],
  )
  if (!p || !q || !r)
    throw new Error('Coordinate map references a missing vertex')
  const determinant = (q.z - r.z) * (p.x - r.x) + (r.x - q.x) * (p.z - r.z)
  if (Math.abs(determinant) < 1e-8)
    throw new Error('Coordinate map contains a degenerate section')
  return { ...section, p, q, r, determinant }
})

export function projectPosition(point: Pick<PlayerTrack[number], 'x' | 'z'>) {
  for (const section of sections) {
    const { p, q, r, determinant } = section
    const first =
      ((q.z - r.z) * (point.x - r.x) + (r.x - q.x) * (point.z - r.z)) /
      determinant
    const second =
      ((r.z - p.z) * (point.x - r.x) + (p.x - r.x) * (point.z - r.z)) /
      determinant
    if (first < -1e-8 || second < -1e-8 || first + second > 1 + 1e-8) continue
    return {
      u: section.a * point.x + section.b * point.z + section.c,
      v: section.d * point.x + section.e * point.z + section.f,
    }
  }
}
