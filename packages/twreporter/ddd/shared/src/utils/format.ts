export function createNumberFormatter(options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat('zh-TW', options)
}

export const formatNumber = createNumberFormatter().format
