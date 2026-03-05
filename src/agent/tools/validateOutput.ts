import { z } from 'zod'
import type { RecipeJSON } from '@/types/recipe'

const UnitEntrySchema = z.object({
  original: z.string(),
  grams: z.number().optional(),
  mlEquivalent: z.number().optional(),
  densitySource: z.string().optional(),
  confidenceLevel: z.enum(['high', 'medium', 'low', 'unknown']),
  explanation: z.string().optional(),
})

const SubstitutionSchema = z.object({
  original: z.string(),
  substitute: z.string(),
  note: z.string().optional(),
  sourceNote: z.enum(['preamble', 'inline']),
})

const IngredientSchema = z.object({
  id: z.string(),
  raw: z.string(),
  name: z.string(),
  quantity: z.number().nullable(),
  unit: z.string().nullable(),
  units: z.array(UnitEntrySchema),
  substitutions: z.array(SubstitutionSchema).optional(),
  annotations: z.array(z.string()).optional(),
})

const StepAnnotationSchema = z.object({
  type: z.enum(['tip', 'warning', 'substitution', 'technique']),
  text: z.string(),
  relatedIngredientIds: z.array(z.string()).optional(),
})

const StepSchema = z.object({
  id: z.string(),
  index: z.number(),
  text: z.string(),
  timingMinutes: z.number().nullish(),
  isCritical: z.boolean(),
  criticalNote: z.string().optional(),
  annotations: z.array(StepAnnotationSchema),
})

const PreambleSchema = z.object({
  raw: z.string(),
  tips: z.array(z.string()),
  substitutions: z.array(SubstitutionSchema),
  techniqueNotes: z.array(z.string()),
})

const RecipeJSONSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  sourceUrl: z.string().optional(),
  sourceDomain: z.string().optional(),
  extractedAt: z.string(),
  preamble: PreambleSchema,
  ingredients: z.array(IngredientSchema).min(1),
  steps: z.array(StepSchema).min(1),
  metadata: z.object({
    totalTimeMinutes: z.number().nullable().optional(),
    prepTimeMinutes: z.number().nullable().optional(),
    cookTimeMinutes: z.number().nullable().optional(),
    servings: z.string().nullable().optional(),
    rawText: z.string().optional(),
  }),
})

export interface ValidateOutputResult {
  valid: boolean
  errors: string[]
}

export function validateOutput(recipe: unknown): ValidateOutputResult {
  const result = RecipeJSONSchema.safeParse(recipe)
  if (result.success) return { valid: true, errors: [] }

  const errors = result.error.issues.map(
    (issue) => `${issue.path.join('.')}: ${issue.message}`,
  )
  return { valid: false, errors }
}

export function parseRecipeJSON(raw: unknown): RecipeJSON {
  return RecipeJSONSchema.parse(raw)
}
