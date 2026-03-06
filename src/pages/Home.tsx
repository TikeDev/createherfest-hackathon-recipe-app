import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getAllRecipes } from '@/storage/recipes'
import type { RecipeJSON } from '@/types/recipe'
import type { EnergyLevel } from './Landing'

const ENERGY_LABELS: Record<EnergyLevel, string> = {
  low:    '🌿 Low energy',
  medium: '☀️ Medium energy',
  high:   '⚡ Feeling good',
}

function sortByEnergy(recipes: RecipeJSON[], energy: EnergyLevel | null): RecipeJSON[] {
  if (!energy || energy === 'medium') return recipes
  return [...recipes].sort((a, b) => {
    const aMin = a.metadata.totalTimeMinutes ?? 999
    const bMin = b.metadata.totalTimeMinutes ?? 999
    return energy === 'low' ? aMin - bMin : bMin - aMin
  })
}

export default function Home() {
  const location = useLocation()
  const navigate = useNavigate()
  const session = location.state as { energy?: EnergyLevel; note?: string } | null
  const hasSession = !!(session?.energy || session?.note)

  const [recipes, setRecipes] = useState<RecipeJSON[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllRecipes()
      .then((all) => setRecipes(sortByEnergy(all, session?.energy ?? null)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-headline text-forest">
          {hasSession ? 'Here\'s what we found.' : 'My Recipes'}
        </h1>
        <Link
          to="/extract"
          className="rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white hover:bg-sage-dark focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 transition-colors"
        >
          + Add Recipe
        </Link>
      </div>

      {/* Session context banner */}
      {hasSession && (
        <div className="rounded-xl bg-surface border border-mist-pale px-4 py-3 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {session?.energy && (
              <span className="rounded-full bg-white border border-mist text-sage text-xs font-semibold px-3 py-1">
                {ENERGY_LABELS[session.energy]}
              </span>
            )}
            {session?.note && (
              <span className="text-sm text-forest/70 italic">"{session.note}"</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs text-forest/50 hover:text-sage transition-colors"
          >
            ← Start over
          </button>
        </div>
      )}

      {loading && (
        <p className="text-sm text-forest/60" role="status">
          Simmer is thinking...
        </p>
      )}

      {!loading && recipes.length === 0 && (
        <div className="rounded-lg border border-dashed border-mist-pale px-6 py-12 text-center space-y-3">
          <p className="text-forest/60 text-sm">No recipes yet.</p>
          <Link
            to="/extract"
            className="inline-block text-sm text-sage font-medium underline hover:text-sage-dark"
          >
            Add your first recipe
          </Link>
        </div>
      )}

      {!loading && recipes.length > 0 && (
        <ul className="space-y-3">
          {recipes.map((recipe) => {
            const savedDate = new Date(recipe.extractedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })
            return (
              <li key={recipe.id}>
                <Link
                  to={`/recipe/${recipe.id}`}
                  className="block rounded-lg border border-mist-pale bg-white px-4 py-4 hover:border-mist hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-headline text-forest text-sm leading-snug">
                      {recipe.title}
                    </h2>
                    <span className="flex-shrink-0 text-xs text-forest/50">{savedDate}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-forest/50">
                    {recipe.sourceDomain && recipe.sourceDomain !== 'demo' && (
                      <span>{recipe.sourceDomain}</span>
                    )}
                    {recipe.metadata.totalTimeMinutes && (
                      <span>{recipe.metadata.totalTimeMinutes} min</span>
                    )}
                    {recipe.metadata.servings && <span>Serves {recipe.metadata.servings}</span>}
                    <span>{recipe.ingredients.length} ingredients</span>
                    <span>{recipe.steps.length} steps</span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
