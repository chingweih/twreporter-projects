import { shellConfigFields } from '../components/shared/types.ts'
import type { ComponentProps } from '../components/types.ts'
import { SearchParam } from './search-param.svelte.ts'

const ratioParam = new SearchParam('ratio')

function parseRatio(value: ComponentProps['ratio'] | null) {
  return shellConfigFields.ratio.safeParse(
    typeof value === 'string' ? Number(value) : value,
  ).data
}

export function resolveShellRatio(
  ratio: ComponentProps['ratio'],
  configRatio?: number,
) {
  const urlRatio =
    typeof window === 'undefined' ? undefined : ratioParam.current
  return parseRatio(urlRatio) ?? parseRatio(ratio) ?? configRatio
}
