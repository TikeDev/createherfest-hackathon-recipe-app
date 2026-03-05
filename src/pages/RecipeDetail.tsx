import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getRecipe } from '@/storage/recipes'
import { IngredientList } from '@/components/recipe/IngredientList'
import { StepList } from '@/components/recipe/StepList'
import type { RecipeJSON } from '@/types/recipe'

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState<RecipeJSON | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getRecipe(id)
      .then((r) => setRecipe(r ?? null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center text-sm text-gray-500" role="status">
        Loading recipe...
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-4">
        <p className="text-gray-500">Recipe not found.</p>
        <Link to="/" className="text-sm text-emerald-600 underline">
          Back to recipes
        </Link>
      </div>
    )
  }

  const extractedDate = new Date(recipe.extractedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-emerald-600 hover:underline mb-4 block"
          aria-label="Go back"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{recipe.title}</h1>
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
          {recipe.sourceDomain && <span>From {recipe.sourceDomain}</span>}
          <span>Saved {extractedDate}</span>
          {recipe.metadata.totalTimeMinutes && (
            <span>{recipe.metadata.totalTimeMinutes} min total</span>
          )}
          {recipe.metadata.servings && <span>Serves {recipe.metadata.servings}</span>}
        </div>
      </div>

      {/* Start Cooking CTA */}
      <button
        onClick={() => navigate(`/cook/${recipe.id}`)}
        className="w-full bg-[#6B9E78] hover:bg-[#4e7a5a] text-white font-bold py-3 px-6 rounded-xl text-sm transition-colors"
      >
        Start Cooking →
      </button>

      {/* Preamble tips */}
      {recipe.preamble.tips.length > 0 && (
        <section aria-labelledby="tips-heading">
          <h2 id="tips-heading" className="text-base font-semibold text-gray-900 mb-2">
            Tips from the author
          </h2>
          <ul className="space-y-1.5">
            {recipe.preamble.tips.map((tip, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span aria-hidden="true" className="text-emerald-500 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </section>
      )}

      <IngredientList ingredients={recipe.ingredients} />
      <StepList steps={recipe.steps} />

      {recipe.sourceUrl && (
        <p className="text-xs text-gray-400">
          Original recipe:{' '}
          <a
            href={recipe.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            {recipe.sourceDomain}
          </a>
        </p>
      )}
    </div>
  )
}
