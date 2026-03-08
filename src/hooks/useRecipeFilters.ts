import { useState, useMemo, useCallback } from 'react'
import type { RecipeJSON } from '@/types/recipe'

export type SortField =
  | 'date-newest'
  | 'date-oldest'
  | 'time-asc'
  | 'time-desc'
  | 'title-az'
  | 'title-za'
  | 'ingredients-asc'
  | 'ingredients-desc'
  | 'steps-asc'
  | 'steps-desc'

export type TimeRange = 'all' | 'quick' | 'medium' | 'long'
export type Complexity = 'all' | 'simple' | 'moderate' | 'complex'
export type Readiness = 'all' | 'eat-soon' | 'plan-ahead'

export interface FilterState {
  timeRange: TimeRange
  complexity: Complexity
  sourceDomain: string | null
  readiness: Readiness
}

const DEFAULT_FILTERS: FilterState = {
  timeRange: 'all',
  complexity: 'all',
  sourceDomain: null,
  readiness: 'all',
}

function matchesSearch(recipe: RecipeJSON, query: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  if (recipe.title.toLowerCase().includes(q)) return true
  if (recipe.sourceDomain?.toLowerCase().includes(q)) return true
  return recipe.ingredients.some((ing) => ing.name.toLowerCase().includes(q))
}

function matchesFilters(recipe: RecipeJSON, filters: FilterState): boolean {
  // Time range filter — recipes with no time data are always included
  if (filters.timeRange !== 'all' && recipe.metadata.totalTimeMinutes != null) {
    const t = recipe.metadata.totalTimeMinutes
    if (filters.timeRange === 'quick' && t > 30) return false
    if (filters.timeRange === 'medium' && (t <= 30 || t > 60)) return false
    if (filters.timeRange === 'long' && t <= 60) return false
  }

  // Complexity filter
  if (filters.complexity !== 'all') {
    const count = recipe.ingredients.length
    if (filters.complexity === 'simple' && count > 7) return false
    if (filters.complexity === 'moderate' && (count <= 7 || count > 15)) return false
    if (filters.complexity === 'complex' && count <= 15) return false
  }

  // Source domain filter
  if (filters.sourceDomain && recipe.sourceDomain !== filters.sourceDomain) return false

  // Readiness filter — "Eat Soon" vs "Plan Ahead"
  // Recipes without time data are excluded when a readiness filter is active
  if (filters.readiness !== 'all') {
    if (recipe.metadata.totalTimeMinutes == null) return false
    const t = recipe.metadata.totalTimeMinutes
    if (filters.readiness === 'eat-soon' && t > 45) return false
    if (filters.readiness === 'plan-ahead' && t < 120) return false
  }

  return true
}

function sortRecipes(recipes: RecipeJSON[], field: SortField): RecipeJSON[] {
  const sorted = [...recipes]
  sorted.sort((a, b) => {
    switch (field) {
      case 'date-newest':
        return new Date(b.extractedAt).getTime() - new Date(a.extractedAt).getTime()
      case 'date-oldest':
        return new Date(a.extractedAt).getTime() - new Date(b.extractedAt).getTime()
      case 'time-asc':
        return (a.metadata.totalTimeMinutes ?? Infinity) - (b.metadata.totalTimeMinutes ?? Infinity)
      case 'time-desc':
        return (b.metadata.totalTimeMinutes ?? -Infinity) - (a.metadata.totalTimeMinutes ?? -Infinity)
      case 'title-az':
        return a.title.localeCompare(b.title)
      case 'title-za':
        return b.title.localeCompare(a.title)
      case 'ingredients-asc':
        return a.ingredients.length - b.ingredients.length
      case 'ingredients-desc':
        return b.ingredients.length - a.ingredients.length
      case 'steps-asc':
        return a.steps.length - b.steps.length
      case 'steps-desc':
        return b.steps.length - a.steps.length
      default:
        return 0
    }
  })
  return sorted
}

export function useRecipeFilters(recipes: RecipeJSON[]) {
  const [query, setQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('date-newest')
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)

  const setFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = () => {
    setQuery('')
    setSortField('date-newest')
    setFilters(DEFAULT_FILTERS)
  }

  const availableDomains = useMemo(() => {
    const domains = new Set<string>()
    for (const r of recipes) {
      if (r.sourceDomain && r.sourceDomain !== 'demo') {
        domains.add(r.sourceDomain)
      }
    }
    return [...domains].sort()
  }, [recipes])

  const filteredRecipes = useMemo(() => {
    const searched = recipes.filter((r) => matchesSearch(r, query))
    const filtered = searched.filter((r) => matchesFilters(r, filters))
    return sortRecipes(filtered, sortField)
  }, [recipes, query, filters, sortField])

  const hasActiveFilters =
    query !== '' ||
    sortField !== 'date-newest' ||
    filters.timeRange !== 'all' ||
    filters.complexity !== 'all' ||
    filters.sourceDomain !== null ||
    filters.readiness !== 'all'

  return {
    query,
    setQuery,
    sortField,
    setSortField,
    filters,
    setFilter,
    resetFilters,
    filteredRecipes,
    resultCount: filteredRecipes.length,
    totalCount: recipes.length,
    availableDomains,
    hasActiveFilters,
  }
}
