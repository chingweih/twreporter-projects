export function withComponentVersion(name: string, version?: number) {
  if (version === undefined) return name
  if (!Number.isSafeInteger(version) || version < 1) {
    throw new Error(`Invalid version for ${name}: ${version}`)
  }
  return `${name}-v${version}`
}
