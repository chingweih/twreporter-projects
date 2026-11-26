/** Ordinary least squares: y = slope * x + intercept. */
export function linearRegression(points: readonly { x: number; y: number }[]) {
  const valid = points.filter(
    (point) => Number.isFinite(point.x) && Number.isFinite(point.y),
  )
  if (valid.length < 2) return
  const meanX = valid.reduce((sum, point) => sum + point.x, 0) / valid.length
  const meanY = valid.reduce((sum, point) => sum + point.y, 0) / valid.length
  let variance = 0
  let covariance = 0
  for (const point of valid) {
    variance += (point.x - meanX) ** 2
    covariance += (point.x - meanX) * (point.y - meanY)
  }
  if (variance === 0) return
  const slope = covariance / variance
  return { slope, intercept: meanY - slope * meanX }
}
