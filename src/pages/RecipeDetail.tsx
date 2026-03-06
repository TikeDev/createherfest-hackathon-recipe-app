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
      <div className="max-w-2xl mx-auto px-4 py-12 text-center text-sm text-forest/60" role="status">
        Simmer is thinking...
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-4">
        <p className="text-forest/60">We couldn't find that recipe.</p>
        <Link to="/recipes" className="text-sm text-sage underline hover:text-sage-dark">
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
          className="text-sm text-sage hover:underline mb-4 block"
          aria-label="Go back"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-headline text-forest">{recipe.title}</h1>
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-forest/60">
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
        className="w-full bg-sage hover:bg-sage-dark text-white font-semibold py-3 px-6 rounded-xl text-sm transition-colors"
      >
        I'm ready. Let's cook →
      </button>

      {/* Preamble tips */}
      {recipe.preamble.tips.length > 0 && (
        <section aria-labelledby="tips-heading">
          <h2 id="tips-heading" className="text-base font-headline text-forest mb-2">
            Tips from the author
          </h2>
          <ul className="space-y-1.5">
            {recipe.preamble.tips.map((tip, i) => (
              <li key={i} className="text-sm text-forest/80 flex gap-2">
                <span aria-hidden="true" className="text-sage mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </section>
      )}

      <IngredientList ingredients={recipe.ingredients} />
      <StepList steps={recipe.steps} />

      {recipe.sourceUrl && (
        <p className="text-xs text-forest/50">
          Original recipe:{' '}
          <a
            href={recipe.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-forest"
          >
            {recipe.sourceDomain}
          </a>
        </p>
      )}
    </div>
  )
}
