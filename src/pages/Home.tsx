import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAllRecipes } from "@/storage/recipes";
import { useRecipeFilters } from "@/hooks/useRecipeFilters";
import { useProfile } from "@/hooks/useProfile";
import { useSmartSuggestions } from "@/hooks/useSmartSuggestions";
import RecipeToolbar from "@/components/recipes/RecipeToolbar";
import RecipeCard from "@/components/recipes/RecipeCard";
import { Icon } from "@/components/ui/icon";
import { Leaf, Sun, Zap, Utensils, Calendar } from "lucide-react";
import type { RecipeJSON } from "@/types/recipe";
import type { EnergyLevel } from "./Landing";
import type { LucideIcon } from "lucide-react";
import type { Readiness } from "@/hooks/useRecipeFilters";

const ENERGY_CONFIG: Record<EnergyLevel, { icon: LucideIcon; label: string; color: string }> = {
  low: { icon: Leaf, label: "Low energy", color: "text-sage" },
  medium: { icon: Sun, label: "Medium energy", color: "text-amber-500" },
  high: { icon: Zap, label: "Feeling good", color: "text-orange-500" },
};

const READINESS_CONFIG: Record<Exclude<Readiness, "all">, { icon: LucideIcon; label: string; color: string }> = {
  "eat-soon": { icon: Utensils, label: "Eat Soon", color: "text-orange-500" },
  "plan-ahead": { icon: Calendar, label: "Plan Ahead", color: "text-sage" },
};

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = location.state as { energy?: EnergyLevel; readiness?: Exclude<Readiness, "all">; note?: string } | null;
  const hasSession = !!(session?.energy || session?.readiness || session?.note);

  const [recipes, setRecipes] = useState<RecipeJSON[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const { profile, loading: profileLoading } = useProfile();

  const searchRef = useRef<HTMLInputElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const announceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    void getAllRecipes()
      .then((all) => setRecipes(all))
      .finally(() => setLoading(false));
  }, []);

  const { suggestions, loading: suggestionsLoading } = useSmartSuggestions(
    hasSession ? session?.energy : null,
    hasSession ? session?.note : null,
    recipes,
    profile,
    profileLoading
  );

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
  } = useRecipeFilters(recipes);

  // Apply readiness filter from session state
  useEffect(() => {
    if (session?.readiness) {
      setFilter("readiness", session.readiness);
    }
  }, [session?.readiness, setFilter]);

  // Debounced live region announcement
  const announce = useCallback((text: string) => {
    clearTimeout(announceTimer.current);
    announceTimer.current = setTimeout(() => {
      if (liveRef.current) liveRef.current.textContent = text;
    }, 300);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (totalCount === 0) return;
    const text =
      resultCount === totalCount
        ? `${totalCount} recipes`
        : resultCount === 0
          ? "No recipes match your search"
          : `Showing ${resultCount} of ${totalCount} recipes`;
    announce(text);
  }, [resultCount, totalCount, loading, announce]);

  // Cleanup timer
  useEffect(() => () => clearTimeout(announceTimer.current), []);

  const handleResetFilters = () => {
    resetFilters();
    searchRef.current?.focus();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-8 space-y-6 md:py-8">
      <div className="space-y-3 md:flex md:items-center md:justify-between md:space-y-0">
        <h1 className="pl-14 text-left text-2xl font-headline text-forest dark:text-cream-text md:pl-0">
          {hasSession ? "Here's what we found." : "My Recipes"}
        </h1>
        <div className="flex justify-end">
          <Link
            to="/extract"
            className="rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white hover:bg-sage-dark focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 transition-colors"
          >
            + Add Recipe
          </Link>
        </div>
      </div>

      {/* Session context banner */}
      {hasSession && (
        <div className="rounded-xl bg-surface border border-mist-pale px-4 py-3 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {session?.energy && (
              <span className="rounded-full bg-surface border border-mist text-sage text-xs font-semibold px-3 py-1 dark:border-forest">
                <Icon
                  icon={ENERGY_CONFIG[session.energy].icon}
                  size="sm"
                  decorative
                  className={`inline mr-1 ${ENERGY_CONFIG[session.energy].color}`}
                />
                {ENERGY_CONFIG[session.energy].label}
              </span>
            )}
            {session?.readiness && (
              <span className="rounded-full bg-surface border border-mist text-sage text-xs font-semibold px-3 py-1 dark:border-forest">
                <Icon
                  icon={READINESS_CONFIG[session.readiness].icon}
                  size="sm"
                  decorative
                  className={`inline mr-1 ${READINESS_CONFIG[session.readiness].color}`}
                />
                {READINESS_CONFIG[session.readiness].label}
              </span>
            )}
            {session?.note && (
              <span className="text-sm text-forest/70 italic dark:text-cream-text/70">
                "{session.note}"
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              void navigate("/");
            }}
            className="text-xs text-forest/50 hover:text-sage transition-colors dark:text-cream-text/50"
          >
            ← Start over
          </button>
        </div>
      )}

      {/* ── Suggestions section (session only) ───────────────── */}
      {hasSession && (
        <section aria-label="Recipe suggestions">
          {suggestionsLoading && (
            <p
              className="text-sm text-forest/60 dark:text-cream-text/60 animate-pulse"
              role="status"
            >
              Finding your best matches…
            </p>
          )}

          {!suggestionsLoading && suggestions.length > 0 && (
            <ul className="space-y-3">
              {suggestions.map((s) => (
                <RecipeCard key={s.recipe.id} recipe={s.recipe} reason={s.reason} />
              ))}
            </ul>
          )}

          {!suggestionsLoading && suggestions.length === 0 && !loading && totalCount > 0 && (
            <p className="text-sm text-forest/60 dark:text-cream-text/60">
              No recipes matched your energy level today.{" "}
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="text-sage underline hover:text-sage-dark"
              >
                Browse all recipes.
              </button>
            </p>
          )}

          {/* Toggle: show / hide full recipe list */}
          {!loading && totalCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-4 text-sm text-forest/50 hover:text-sage dark:text-cream-text/50 transition-colors"
              aria-expanded={showAll}
            >
              {showAll ? "↑ Hide all recipes" : `↓ Show all ${totalCount} recipes`}
            </button>
          )}
        </section>
      )}

      {/* ── Full recipe list ──────────────────────────────────── */}
      {/* Always visible when there's no session; toggled when there is one */}

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

      {!loading && totalCount > 0 && (!hasSession || showAll) && (
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
          <div
            ref={liveRef}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          />

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
  );
}
