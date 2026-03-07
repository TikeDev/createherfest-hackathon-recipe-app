import { useEffect, useState, useRef, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getAllRecipes } from '@/storage/recipes'
import { useRecipeFilters } from '@/hooks/useRecipeFilters'
import RecipeToolbar from '@/components/recipes/RecipeToolbar'
import RecipeCard from '@/components/recipes/RecipeCard'
import { Icon } from '@/components/ui/icon'
import { Leaf, Sun, Zap } from 'lucide-react'
import type { RecipeJSON } from '@/types/recipe'
import type { EnergyLevel } from './Landing'
import type { LucideIcon } from 'lucide-react'

const ENERGY_CONFIG: Record<EnergyLevel, { icon: LucideIcon; label: string; color: string }> = {
  low:    { icon: Leaf, label: 'Low energy',   color: 'text-sage' },
  medium: { icon: Sun,  label: 'Medium energy', color: 'text-amber-500' },
  high:   { icon: Zap,  label: 'Feeling good',  color: 'text-orange-500' },
}

export default function Home() {
  const location = useLocation()
  const navigate = useNavigate()
  const session = location.state as { energy?: EnergyLevel; note?: string } | null
  const hasSession = !!(session?.energy || session?.note)

  const [recipes, setRecipes] = useState<RecipeJSON[]>([])
  const [loading, setLoading] = useState(true)

  const searchRef = useRef<HTMLInputElement>(null)
  const liveRef = useRef<HTMLDivElement>(null)
  const announceTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    getAllRecipes()
      .then((all) => setRecipes(all))
      .finally(() => setLoading(false))
  }, [])

  const {
    query,
    setQuery,
    sortField,
    setSortField,
    filters,
    setFilter,
    resetFilters,
    filteredRecipes,
    resultCount,
    totalCount,
    availableDomains,
    hasActiveFilters,
  } = useRecipeFilters(recipes)

  // Debounced live region announcement
  const announce = useCallback(
    (text: string) => {
      clearTimeout(announceTimer.current)
      announceTimer.current = setTimeout(() => {
        if (liveRef.current) liveRef.current.textContent = text
      }, 300)
    },
    [],
  )

  useEffect(() => {
    if (loading) return
    if (totalCount === 0) return
    const text =
      resultCount === totalCount
        ? `${totalCount} recipes`
        : resultCount === 0
          ? 'No recipes match your search'
          : `Showing ${resultCount} of ${totalCount} recipes`
    announce(text)
  }, [resultCount, totalCount, loading, announce])

  // Cleanup timer
  useEffect(() => () => clearTimeout(announceTimer.current), [])

  const handleResetFilters = () => {
    resetFilters()
    searchRef.current?.focus()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-headline text-forest dark:text-cream-text">
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
              <span className="rounded-full bg-surface border border-mist text-sage text-xs font-semibold px-3 py-1 dark:border-forest">
                <Icon icon={ENERGY_CONFIG[session.energy].icon} size="sm" decorative className={`inline mr-1 ${ENERGY_CONFIG[session.energy].color}`} />
                {ENERGY_CONFIG[session.energy].label}
              </span>
            )}
            {session?.note && (
              <span className="text-sm text-forest/70 italic dark:text-cream-text/70">"{session.note}"</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs text-forest/50 hover:text-sage transition-colors dark:text-cream-text/50"
          >
            ← Start over
          </button>
        </div>
      )}

      {loading && (
        <p className="text-sm text-forest/60 dark:text-cream-text/60" role="status">
          Simmer is thinking...
        </p>
      )}

      {!loading && totalCount === 0 && (
        <div className="rounded-lg border border-dashed border-mist-pale px-6 py-12 text-center space-y-3">
          <p className="text-forest/60 text-sm dark:text-cream-text/60">No recipes yet.</p>
          <Link
            to="/extract"
            className="inline-block text-sm text-sage font-medium underline hover:text-sage-dark"
          >
            Add your first recipe
          </Link>
        </div>
      )}

      {!loading && totalCount > 0 && (
        <>
          {/* Search, sort, filter toolbar */}
          <RecipeToolbar
            query={query}
            onQueryChange={setQuery}
            sortField={sortField}
            onSortChange={setSortField}
            filters={filters}
            onFilterChange={setFilter}
            onReset={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
            availableDomains={availableDomains}
            searchRef={searchRef}
          />

          {/* Live region for screen reader announcements */}
          <div ref={liveRef} role="status" aria-live="polite" aria-atomic="true" className="sr-only" />

          {/* Visible results count */}
          {resultCount !== totalCount && (
            <p className="text-xs text-forest/50 dark:text-cream-text/50">
              Showing {resultCount} of {totalCount} recipes
            </p>
          )}

          {/* Recipe list */}
          {filteredRecipes.length > 0 ? (
            <ul className="space-y-3">
              {filteredRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-dashed border-mist-pale px-6 py-12 text-center space-y-3">
              <p className="text-forest/60 text-sm dark:text-cream-text/60">
                No recipes match your search.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-sm text-sage font-medium underline hover:text-sage-dark focus:outline-none focus:ring-2 focus:ring-sage"
              >
                Clear all filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
