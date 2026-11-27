export const partyColorVars = {
  中國國民黨: '--elec-kmt',
  民主進步黨: '--elec-dpp',
  台灣民眾黨: '--elec-tpp',
  台灣前進: '--elec-gogo',
  無黨籍: '--elec-gray',
  其他: '--elec-gray-4',
} as const

export function resolvePartyColor(party: string) {
  const aliases: Record<string, string> = {
    國民黨: '中國國民黨',
    民進黨: '民主進步黨',
    民眾黨: '台灣民眾黨',
  }
  const name = party.trim().replaceAll('臺', '台')
  const [label, colorVar] = Object.entries(partyColorVars).find(
    ([label]) => label === (aliases[name] ?? name),
  ) ?? ['其他', partyColorVars.其他]
  return { label, colorVar }
}
