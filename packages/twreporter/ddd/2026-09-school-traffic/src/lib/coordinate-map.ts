import { z } from 'zod'

export const coordinateVertexSchema = z.object({
  landmark: z.string(),
  x: z.number(),
  z: z.number(),
  u: z.number(),
  v: z.number(),
})
export const coordinateMapSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
  landmarks: z.array(coordinateVertexSchema),
  vertices: z.array(coordinateVertexSchema).min(3),
  sections: z
    .array(
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
    )
    .min(1),
})

export type CoordinateMap = z.infer<typeof coordinateMapSchema>
export type CoordinateVertex = z.infer<typeof coordinateVertexSchema>
export type WorldPoint = Pick<CoordinateVertex, 'x' | 'z'>
export type MapPoint = Pick<CoordinateVertex, 'u' | 'v'>

export function createPositionProjector(map: CoordinateMap) {
  const sections = map.sections.map((section) => {
    const [p, q, r] = section.vertices.map((index) => map.vertices[index])
    if (!p || !q || !r)
      throw new Error('Coordinate map references a missing vertex')
    const determinant = (q.z - r.z) * (p.x - r.x) + (r.x - q.x) * (p.z - r.z)
    if (Math.abs(determinant) < 1e-8)
      throw new Error('Coordinate map contains a degenerate section')
    return { ...section, p, q, r, determinant }
  })

  return function projectPosition(point: WorldPoint) {
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
}
