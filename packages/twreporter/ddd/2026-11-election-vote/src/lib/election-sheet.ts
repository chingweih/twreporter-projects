import {
  fetchText,
  parseCsv,
  requireCsvColumns,
} from '@lab-reporter/ddd-shared/utils/fetchers.ts'
import { queryOptions } from '@tanstack/svelte-query'
import { z } from 'zod'

export const sheetNumber = z
  .string()
  .trim()
  .regex(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/)
  .transform((value) => Number(value.replaceAll(',', '')))
  .pipe(z.number())
export const sheetCount = sheetNumber.pipe(z.int().nonnegative())
export const sheetPositiveCount = sheetNumber.pipe(z.int().positive())
export const sheetTownshipCode = z
  .string()
  .trim()
  .regex(/^\d{1,8}$/)
const percentageText = z
  .string()
  .trim()
  .transform((value) => value.replace(/%$/, '').trim())
const percentageNumber = sheetNumber.pipe(z.number().min(0).max(100))
export const sheetPercentage = percentageText.pipe(percentageNumber)
export const sheetPercentageWithText = percentageText
  .transform((text) => ({ text, value: text }))
  .pipe(z.object({ text: z.string(), value: percentageNumber }))

export function createElectionSheet({
  sheetId,
  queryNamespace,
}: {
  sheetId: string
  queryNamespace: string
}) {
  return function electionTab<Columns extends z.ZodRawShape>(
    tabId: string,
    rowSchema: z.ZodObject<Columns>,
    normalizeHeader: (header: string) => string = (header) => header,
  ) {
    const columns = Object.keys(rowSchema.shape).filter(
      (column) => !z.safeParse(rowSchema.shape[column], undefined).success,
    )
    const rowsSchema = rowSchema.array()

    async function fetchRows(signal?: AbortSignal) {
      const refresh =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).has('refresh')
      const url = refresh
        ? `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${tabId}`
        : `https://projects.twreporter.org/twreporter/ddd/2026-11-election-vote/sheets/${sheetId}/${tabId}.csv`
      const csvText = await fetchText(url, signal)
      try {
        const csv = parseCsv(csvText)
        csv.headers = csv.headers.map(normalizeHeader)
        if (new Set(csv.headers).size !== csv.headers.length)
          throw new Error('CSV 欄位名稱重複。')
        csv.rows = csv.rows.map((row) =>
          Object.fromEntries(
            Object.entries(row).map(([key, value]) => [
              normalizeHeader(key),
              value,
            ]),
          ),
        )
        requireCsvColumns(csv, columns)
        return rowsSchema.parse(csv.rows)
      } catch (cause) {
        throw new Error(
          `Invalid election CSV in ${queryNamespace} tab ${tabId}`,
          {
            cause,
          },
        )
      }
    }

    return {
      fetchRows,
      options: queryOptions({
        queryKey: [queryNamespace, tabId] as const,
        queryFn: ({ signal }) => fetchRows(signal),
      }),
    }
  }
}
