import { z } from 'zod'
import type { CSVData } from '@lab-reporter/ddd-shared/utils/fetchers.ts'
import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
import {
  colorSchema,
  shellConfigFields,
} from '@lab-reporter/ddd-shared/components/shared/types.ts'

export const topicSchema = z
  .object({
    id: z
      .string()
      .min(1)
      .meta({ title: '主題 ID', description: '同時用作 CSV 題目 ID 的前綴。' }),
    label: z.string().min(1).meta({ title: '主題名稱' }),
    question: z.string().meta({ title: '題目文字', 'ui:widget': 'textarea' }),
  })
  .meta({ 'ui:order': ['id', 'label', 'question'] })

export const categorySchema = z
  .object({
    id: z.number().int().positive().meta({ title: '領域 ID' }),
    label: z.string().min(1).meta({ title: '領域名稱' }),
    topics: z
      .array(topicSchema)
      .min(1)
      .meta({
        title: '主題',
        'ui:options': { titleKey: 'label', collapsible: true },
      }),
  })
  .meta({ 'ui:order': ['id', 'label', 'topics'] })

export const candidateSchema = z
  .object({
    name: z.string().min(1).meta({ title: '姓名' }),
    party: z.string().nullable().meta({ title: '黨籍', 'ui:emptyValue': null }),
    photo: z
      .url()
      .nullable()
      .meta({ title: '照片網址', 'ui:emptyValue': null }),
  })
  .meta({ 'ui:order': ['name', 'party', 'photo'] })

export const verdictSchema = z
  .object({
    label: z.string().min(1).meta({ title: '評比' }),
    color: colorSchema,
  })
  .meta({ 'ui:order': ['label', 'color'] })

const answerKeySchema = z.object({
  questionId: z.string().min(1),
  city: z.string().min(1),
  candidate: z.string().min(1),
})

export const answerRowSchema = answerKeySchema.extend({
  title: z.string().nullable(),
  content: z.string().min(1).nullable(),
  existingPolicy: z.boolean(),
})

export const reviewRowSchema = answerKeySchema.extend({
  verdict: z.string().nullable(),
  analysis: z.string(),
  source: z.string(),
})

export const answerCsvRowSchema = answerRowSchema.extend({
  title: z.string().transform((value) => (value === '' ? null : value)),
  content: z.string().transform((value) => (value === '' ? null : value)),
  existingPolicy: z.stringbool({ truthy: ['true'], falsy: ['false'] }),
})

export const reviewCsvRowSchema = reviewRowSchema.extend({
  verdict: z
    .string()
    .transform((value) => (value.trim() === '' ? null : value)),
})

const labelsSchema = z
  .object({
    unanswered: z
      .string()
      .meta({ title: '候選人未回答', 'ui:widget': 'textarea' }),
    existingPolicy: z.string().meta({ title: '既有政策標籤' }),
    reviewDetails: z.string().meta({ title: '評析展開按鈕' }),
  })
  .meta({
    title: '介面文字',
    'ui:order': ['unanswered', 'existingPolicy', 'reviewDetails'],
  })

export const cardExplorerConfigSchema = z
  .object(shellConfigFields)
  .omit({ title: true })
  .extend({
    categories: z
      .array(categorySchema)
      .min(1)
      .meta({
        title: '領域',
        'ui:options': { titleKey: 'label', collapsible: true },
      }),
    candidates: z.array(candidateSchema).meta({
      title: '候選人',
      'ui:options': { titleKey: 'name', collapsible: true },
    }),
    verdicts: z.array(verdictSchema).meta({
      title: '評比顏色',
      'ui:options': { titleKey: 'label', collapsible: true },
    }),
    labels: labelsSchema,
  })
  .meta({
    'ui:order': [
      'categories',
      'candidates',
      'verdicts',
      'labels',
      'subtitle',
      'footnotes',
      'wide',
      'backdrop',
    ],
  })

export type CardExplorerConfig = z.infer<typeof cardExplorerConfigSchema>
export type Category = z.infer<typeof categorySchema>
export type Topic = z.infer<typeof topicSchema>
export type Candidate = z.infer<typeof candidateSchema>
export type Verdict = z.infer<typeof verdictSchema>
export type AnswerRow = z.infer<typeof answerRowSchema>
export type ReviewRow = z.infer<typeof reviewRowSchema>
export type Review = ReviewRow & { csvRow: CSVData['rows'][number] }
export type Policy = AnswerRow & {
  csvRow: CSVData['rows'][number]
  reviews: Review[]
}
export type ExplorerProps = Pick<ComponentProps, 'config'> & {
  sources: { answers: string; reviews: string }
  categoryId?: Category['id']
  topicId?: Topic['id']
  city?: AnswerRow['city']
}
