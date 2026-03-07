# Architecture

## Table of Contents
- [Core User Flow](#core-user-flow)
- [Key Source Files](#key-source-files)

---

## Core User Flow

```
User profile + optional session input (energy level 1–3 + free text)
        ↓
Hard filter: block allergens, excluded ingredients, restricted tools, cognitiveScore > energyLevel
        ↓
Soft scoring: NL query relevance, time preference, preferred appliances
  OR LLM-ranked via suggestionAgent (gpt-5-nano, falls back to pure function)
        ↓
Ranked recommendations with "Why this fits you" reasons
        ↓
Recipe detail → step-by-step CookingMode (timer alarms + grocery list)
```

## Key Source Files

```
api/scrape-recipe.py             # Python recipe scraper proxy
src/agent/recipeAgent.ts         # Extraction agent loop (gpt-5-nano, 30 iter cap)
src/agent/suggestionAgent.ts     # Single-call LLM ranker + rule-based fallback
src/agent/classifyGroceries.ts   # Grocery category classifier (gpt-5-nano)
src/agent/fetcher.ts             # URL fetch + Readability
src/agent/toolDefinitions.ts     # Tool schemas for function calling
src/agent/tools/                 # 6 pure tool functions
src/lib/suggestRecipes.ts        # Pure deterministic recommendation engine
src/lib/cognitiveScore.ts        # Weighted 5-signal complexity scorer (1–3)
src/lib/densityTable.ts          # ~60 ingredient densities for unit conversion
src/storage/db.ts                # IDB v2: recipes, queue, profile, customAlarms
src/storage/recipes.ts           # Recipe CRUD
src/storage/profile.ts           # Profile CRUD + alarm preference migration
src/storage/queue.ts             # Offline queue
src/storage/customAlarms.ts      # Custom alarm audio (IndexedDB blob storage)
src/storage/seed.ts              # Pre-seeded recipe dataset
src/utils/alarm.ts               # playAlarm / stopAlarm using profile settings
src/constants/alarmSounds.ts     # Built-in alarm sound registry
src/contexts/ViewPreferencesContext.tsx  # Font size + high contrast context
src/hooks/useRecipeExtraction.ts # Extraction state machine hook
src/hooks/useRecipeFilters.ts    # Filter/search hook for recipe list
src/hooks/useSmartSuggestions.ts # Suggestion agent + fallback hook
src/hooks/useProfile.ts          # Profile read hook
src/components/ui/               # OfflineBanner, ThemeToggle, VisualAlarm, slider, etc.
src/components/layout/           # AppLayout, SidePanel, HamburgerButton
src/components/extraction/       # RecipeInput, ExtractionProgress
src/components/recipe/           # IngredientList (unit toggle), StepList (checkboxes)
src/components/recipes/          # RecipeCard, RecipeToolbar
src/pages/                       # Landing, Home, Extract, RecipeDetail, CookingMode, Profile
```

See also: [docs/plans/Plan_Overview_Diagram.md](plans/Plan_Overview_Diagram.md) for Mermaid flow diagrams.
