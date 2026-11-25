import { z } from 'zod'
import { requireCsvColumns, type CSVData } from '../../utils/fetchers.ts'
import type { BarChartBar, BarChartGroup } from '../shared/types.ts'
import type { BarChartConfig } from './types.ts'

const csvNumber = z
  .string()
  .trim()
  .regex(/^[+-]?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/)
  .transform((value) => Number(value.replaceAll(',', '')))
  .pipe(z.number())

export function parseBarChartCsv(
  csv: CSVData,
  {
    seriesColumn,
    valueColumn,
    groupColumn,
    labelColumn,
    valueLabels,
  }: Pick<
    BarChartConfig,
    | 'seriesColumn'
    | 'valueColumn'
    | 'groupColumn'
    | 'labelColumn'
    | 'valueLabels'
  >,
): BarChartGroup[] {
  requireCsvColumns(csv, [
    seriesColumn,
    valueColumn,
    groupColumn ?? '',
    labelColumn ?? '',
    ...(valueLabels ?? []).map((label) => label.column),
  ])

  const groups = new Map<string, BarChartBar[]>()
  for (const [index, row] of csv.rows.entries()) {
    const series = row[seriesColumn].trim()
    if (!series) {
      throw new Error(`第 ${index + 1} 筆資料的「${seriesColumn}」為空白。`)
    }
    const value = csvNumber.safeParse(row[valueColumn])
    if (!value.success) {
      throw new Error(`第 ${index + 1} 筆資料的「${valueColumn}」須為數字。`)
    }

    const group = groupColumn ? row[groupColumn].trim() : ''
    const label = labelColumn ? row[labelColumn].trim() : ''
    const bar: BarChartBar = {
      series,
      value: value.data,
      label: label || undefined,
      ...(valueLabels?.length
        ? {
            valueLabels: valueLabels.map(({ column, position }) => ({
              text: row[column].trim(),
              position,
            })),
          }
        : {}),
    }
    const bars = groups.get(group)
    if (bars) bars.push(bar)
    else groups.set(group, [bar])
  }
  return Array.from(groups, ([label, bars]) => ({
    label: label || undefined,
    bars,
  }))
}
