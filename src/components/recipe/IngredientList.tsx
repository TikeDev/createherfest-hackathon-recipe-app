import { useState } from 'react'
import type { Ingredient } from '@/types/recipe'

type UnitMode = 'original' | 'metric' | 'volume'

interface IngredientListProps {
  ingredients: Ingredient[]
}

function formatUnit(ingredient: Ingredient, mode: UnitMode): string {
  if (mode === 'original' || ingredient.units.length === 0) {
    return ingredient.raw
  }

  const entry = ingredient.units[0]

  if (mode === 'metric' && entry?.grams != null) {
    const confidence = entry.confidenceLevel !== 'high' ? ` (~)` : ''
    return `${entry.grams}g${confidence} ${ingredient.name}`
  }

  if (mode === 'volume' && entry?.mlEquivalent != null) {
    const confidence = entry.confidenceLevel !== 'high' ? ` (~)` : ''
    return `${entry.explanation ?? `${entry.mlEquivalent}ml`}${confidence} ${ingredient.name}`
  }

  return ingredient.raw
}

export function IngredientList({ ingredients }: IngredientListProps) {
  const [unitMode, setUnitMode] = useState<UnitMode>('original')
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set())

  function toggleSubs(id: string) {
    setExpandedSubs((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <section aria-labelledby="ingredients-heading">
      <div className="flex items-center justify-between mb-3">
        <h2 id="ingredients-heading" className="text-lg font-headline text-forest">
          Ingredients
        </h2>

        {/* Unit toggle */}
        <div role="group" aria-label="Unit display mode" className="flex gap-1 text-xs">
          {(['original', 'metric', 'volume'] as UnitMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setUnitMode(mode)}
              aria-pressed={unitMode === mode}
              className={`px-2 py-1 rounded border transition-colors ${
                unitMode === mode
                  ? 'bg-sage text-white border-sage'
                  : 'border-mist-pale text-forest/70 hover:border-sage'
              }`}
            >
              {mode === 'original' ? 'As written' : mode === 'metric' ? 'Grams' : 'No scale'}
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-2">
        {ingredients.map((ingredient) => (
          <li key={ingredient.id} className="text-sm text-forest">
            <div className="flex items-start justify-between gap-2">
              <span>{formatUnit(ingredient, unitMode)}</span>

              {ingredient.substitutions && ingredient.substitutions.length > 0 && (
                <button
                  onClick={() => toggleSubs(ingredient.id)}
                  aria-expanded={expandedSubs.has(ingredient.id)}
                  className="flex-shrink-0 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800 hover:bg-amber-200 transition-colors"
                >
                  {expandedSubs.has(ingredient.id) ? 'Hide subs' : 'Substitutions'}
                </button>
              )}
            </div>

            {ingredient.units[0]?.explanation && (
              <p className="mt-0.5 text-xs text-forest/60 italic">
                {ingredient.units[0].explanation}
              </p>
            )}

            {expandedSubs.has(ingredient.id) && ingredient.substitutions?.map((sub, i) => (
              <div key={i} className="mt-1 ml-3 rounded bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-gray-700">
                <span className="font-medium">{sub.original}</span>
                {' → '}
                <span>{sub.substitute}</span>
                {sub.note && <p className="mt-0.5 text-gray-500">{sub.note}</p>}
              </div>
            ))}
          </li>
        ))}
      </ul>
    </section>
  )
}
