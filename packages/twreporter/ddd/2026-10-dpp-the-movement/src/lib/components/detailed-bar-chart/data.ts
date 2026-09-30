import {
  requireCsvColumns,
  type CSVData,
} from '@lab-reporter/ddd-shared/utils/fetchers.ts'
import type { DetailedBarChartConfig } from './types.ts'

export function buildDetailedBarChart(
  csv: CSVData,
  config: DetailedBarChartConfig,
) {
  requireCsvColumns(csv, [
    ...Object.values(config.columns),
    config.cardFilter.column,
  ])
  const rows = csv.rows
    .map((row, index) => {
      const group = row[config.columns.group]?.trim() ?? ''
      const label = row[config.columns.label]?.trim() ?? ''
      const filter = row[config.columns.filter]?.trim() ?? ''
      const value = row[config.columns.value]?.trim() ?? ''
      const amount = Number(value.replace(/,/g, ''))
      if (
        !group ||
        !label ||
        (config.columns.filter && !filter) ||
        !value ||
        !Number.isFinite(amount) ||
        amount < 0
      )
        throw new Error(
          `CSV 第 ${index + 2} 列的群組、名稱、篩選值或金額無效。`,
        )
      return {
        group,
        label,
        filter,
        amount,
        highlighted:
          row[config.columns.category]?.trim() === config.highlight.value,
        cardVisible:
          !config.cardFilter.column ||
          !config.cardFilter.values.length ||
          config.cardFilter.values.includes(
            row[config.cardFilter.column]?.trim() ?? '',
          ),
        description: row[config.columns.description]?.trim() ?? '',
        section: row[config.columns.section]?.trim() ?? '',
        detail: row[config.columns.detail]?.trim() ?? '',
        breakdown:
          row[config.columns.breakdown]?.trim() || config.remainder.label,
      }
    })
    .filter((row) => row.amount > 0)
  const options = !config.columns.filter
    ? [{ value: '', label: '' }]
    : [...new Set(rows.map((row) => row.filter))].map((value) => ({
        value,
        label: value,
      }))
  const filters = options.map((option) => {
    const records = rows.filter(
      (row) => !config.columns.filter || row.filter === option.value,
    )
    const allGroups = [...new Set(records.map((row) => row.group))].map(
      (value) => {
        const donations = records.filter((row) => row.group === value)
        const total = donations.reduce((sum, row) => sum + row.amount, 0)
        return {
          value,
          label: value,
          donations,
          total,
          recipients: new Set(
            donations.filter((row) => row.cardVisible).map((row) => row.label),
          ),
        }
      },
    )
    const groups = allGroups
      .map((group) => ({
        ...group,
        overlap: allGroups.reduce(
          (sum, other) =>
            sum +
            (other === group
              ? 0
              : [...group.recipients].filter((label) =>
                  other.recipients.has(label),
                ).length),
          0,
        ),
      }))
      .sort(
        (a, b) =>
          b.recipients.size - a.recipients.size ||
          b.overlap - a.overlap ||
          b.total - a.total,
      )
    const rosterRows = records.filter((row) => row.cardVisible)
    const roster = [...new Set(rosterRows.map((row) => row.label))]
      .map((label) => {
        const donations = rosterRows.filter((row) => row.label === label)
        const details = [
          ...new Set(donations.map((row) => row.detail).filter(Boolean)),
        ].sort()
        const descriptions = [
          ...new Set(donations.map((row) => row.description).filter(Boolean)),
        ]
        const sections = [...new Set(donations.map((row) => row.section))]
        if (sections.length > 1)
          throw new Error(`「${label}」有多個名單分組，請在來源資料中統一。`)
        const section = sections[0] ?? ''
        return {
          label,
          donations,
          details,
          descriptions,
          section,
          total: donations.reduce((sum, row) => sum + row.amount, 0),
          groupCount: new Set(donations.map((row) => row.group)).size,
        }
      })
      .sort((a, b) => b.groupCount - a.groupCount || b.total - a.total)
    const sectionNames = [...new Set(rosterRows.map((row) => row.section))]
    const sections = sectionNames
      .map((label) => ({
        label,
        candidates: roster.filter((candidate) => candidate.section === label),
      }))
      .filter((section) => section.candidates.length)
    return {
      value: option.value,
      label: option.label || option.value,
      groups,
      roster,
      sections,
    }
  })
  return { filters }
}
