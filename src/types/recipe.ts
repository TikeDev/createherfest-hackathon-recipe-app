export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'unknown'

export interface UnitEntry {
  original: string
  grams?: number
  mlEquivalent?: number
  densitySource?: string
  confidenceLevel: ConfidenceLevel
  explanation?: string // Used for nonstandard units e.g. "hand of garlic ≈ 1 bulb"
}

export interface Substitution {
  original: string
  substitute: string
  note?: string
  sourceNote: 'preamble' | 'inline'
}

export type GroceryCategory =
  | 'Produce'
  | 'Protein'
  | 'Dairy'
  | 'Pantry'
  | 'Spices & Seasonings'
  | 'Oils & Vinegars'
  | 'Canned & Jarred'
  | 'Frozen'
  | 'Bakery'
  | 'Beverages'
  | 'Other'

export interface Ingredient {
  id: string
  raw: string // Original text exactly as it appeared in the recipe
  name: string // Normalized name e.g. "all-purpose flour"
  quantity: number | null
  unit: string | null
  units: UnitEntry[] // All available unit representations (original + conversions)
  substitutions?: Substitution[]
  annotations?: string[]
  category?: GroceryCategory
}

export type AnnotationType = 'tip' | 'warning' | 'substitution' | 'technique'

export interface StepAnnotation {
  type: AnnotationType
  text: string
  relatedIngredientIds?: string[]
}

export interface Step {
  id: string
  index: number
  text: string
  timingMinutes?: number
  isCritical: boolean // e.g. overnight marinade, dough rising — must not be skipped
  criticalNote?: string
  annotations: StepAnnotation[]
}

export interface Preamble {
  raw: string
  tips: string[]
  substitutions: Substitution[]
  techniqueNotes: string[]
}

export interface RecipeMetadata {
  totalTimeMinutes?: number
  prepTimeMinutes?: number
  cookTimeMinutes?: number
  servings?: string
  rawText?: string // Preserved so the user can read the original while offline
}

export interface RecipeJSON {
  id: string
  title: string
  sourceUrl?: string
  sourceDomain?: string
  extractedAt: string // ISO 8601 timestamp
  preamble: Preamble
  ingredients: Ingredient[]
  steps: Step[]
  metadata: RecipeMetadata
}
