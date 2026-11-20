import { z } from 'zod'
import type { CSVData } from '@lab-reporter/ddd-shared/utils/fetchers.ts'
import type { ComponentProps } from '@lab-reporter/ddd-shared/components/types.ts'
import {
  colorSchema,
  shellConfigFields,
} from '@lab-reporter/ddd-shared/components/shared/types.ts'

const topicQuestionSchema = z
  .object({
    id: z.string().min(1).meta({ title: 'CSV 題目 ID' }),
    label: z.string().min(1).meta({ title: '選項名稱' }),
  })
  .meta({ 'ui:order': ['id', 'label'] })

export const topicSchema = z
  .object({
    id: z
      .string()
      .min(1)
      .meta({ title: '主題 ID', description: '同時用作 CSV 題目 ID 的前綴。' }),
    label: z.string().min(1).meta({ title: '主題名稱' }),
    question: z.string().meta({ title: '題目文字', 'ui:widget': 'textarea' }),
    questions: z
      .array(topicQuestionSchema)
      .optional()
      .meta({
        title: '手機版題目選項',
        description: '每個選項對應 CSV 裡的一個完整題目 ID。',
        'ui:options': { titleKey: 'label', collapsible: true },
      }),
  })
  .refine(
    ({ id, questions }) => {
      if (!questions) return true
      const questionIds = questions.map((question) => question.id)
      return (
        new Set(questionIds).size === questionIds.length &&
        questionIds.every((questionId) => questionId.startsWith(id))
      )
    },
    {
      path: ['questions'],
      message: '題目 ID 不可重複，且須以主題 ID 開頭。',
    },
  )
  .meta({ 'ui:order': ['id', 'label', 'question', 'questions'] })

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

const photoSourceSchema = z.union([
  z.url(),
  z.string().regex(/^[^/\\]+_(電腦|手機)\.png$/),
])

export const candidateSchema = z
  .object({
    name: z.string().min(1).meta({ title: '姓名' }),
    party: z.string().nullable().meta({ title: '黨籍', 'ui:emptyValue': null }),
    photo: z
      .object({
        desktop: photoSourceSchema.meta({ title: '電腦照片' }),
        mobile: photoSourceSchema.meta({ title: '手機照片' }),
      })
      .meta({ 'ui:order': ['desktop', 'mobile'] })
      .nullable()
      .meta({
        title: '照片',
        description: '填入 assets/candidate 中的 PNG 檔名或完整圖片 URL。',
        'ui:emptyValue': null,
      }),
    number: z.number().optional().meta({ title: '候選人號次' }),
  })
  .meta({ 'ui:order': ['name', 'number', 'party', 'photo'] })

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
  brief_content: z.string().nullable(),
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
  brief_content: z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value : null)),
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
  subQuestionId?: AnswerRow['questionId']
  city?: AnswerRow['city']
}
