export const partyColorVars = {
  中國國民黨: '--elec-kmt',
  民主進步黨: '--elec-dpp',
  台灣民眾黨: '--elec-tpp',
  台灣前進: '--elec-gogo',
  無黨籍: '--elec-grayscale',
  其他: '--elec-grayscale-4',
} as const

export function resolvePartyColor(party: string) {
  const [label, colorVar] = Object.entries(partyColorVars).find(
    ([label]) => label === party,
  ) ?? ['其他', partyColorVars.其他]
  return { label, colorVar }
}
