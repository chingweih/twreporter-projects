import { createNumberFormatter } from '@lab-reporter/ddd-shared/utils/format.ts'

export const formatRate = createNumberFormatter({
  minimumFractionDigits: 2,
  maximumFractionDigits: 20,
}).format

export function formatPercentage(value: number) {
  return `${formatRate(value)}%`
}
