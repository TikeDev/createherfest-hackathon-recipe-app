# Simmer — Systems Engineering Assessment

**Purpose:** Project cohesion and completeness from a systems engineering perspective. Not a scoring rubric — a structural audit of the system as built.

**Method:** Source-level tracing. Each finding cites the exact file and line where the gap exists or was confirmed. Findings are marked as:
- **[CONFIRMED]** — verified from source code
- **[VERIFY]** — behavior needs a live run to confirm
- **[ASSUMED]** — reasoned from architecture, not yet read

---

## 1. System Boundary Map

```
Browser (IndexedDB)
├── Profile           src/storage/profile.ts
├── Recipes           src/storage/recipes.ts
├── Queue             src/storage/queue.ts
└── Custom Alarms     src/storage/customAlarms.ts

Client-side AI (OpenAI, dangerouslyAllowBrowser: true)
├── Extraction agent  src/agent/recipeAgent.ts       (gpt-5-nano, temp=1, 30-iter loop)
├── Suggestion agent  src/agent/suggestionAgent.ts   (gpt-5-nano, temp=0.4, single call)
└── Grocery agent     src/agent/classifyGroceries.ts (gpt-5-nano, assumed)

Server (Vercel, Python)
└── Scraper proxy     api/scrape-recipe.py

Client-side pure logic
├── Recommendation    src/lib/suggestRecipes.ts      (deterministic, no API)
├── Cognitive scorer  src/lib/cognitiveScore.ts
└── Unit converter    src/lib/densityTable.ts
```

---

## 2. End-to-End Data Flow Trace

### 2.1 Happy Path: Landing → Suggestions → Recipe Detail → Cooking Mode

```
Landing.tsx
  └─ user selects energy chip + types note
  └─ navigate("/recipes", { state: { energy, note } })

Home.tsx
  └─ reads state via useLocation() → hasSession = true
  └─ loads all recipes from IndexedDB (getAllRecipes)
  └─ calls useSmartSuggestions(energy, note, recipes, profile)
       └─ runSuggestionAgentWithFallback()
            ├─ hardFilterRecipes() → eligible pool (client-side, no API)
            ├─ runSuggestionAgent() → LLM call → SmartSuggestion[]
            └─ on fail/empty → suggestRecipes() fallback → SmartSuggestion[]
  └─ renders RecipeCard for each SmartSuggestion
       └─ passes reason={s.reason} (singular string from LLM or matchReasons[0])

RecipeCard.tsx
  └─ <Link to={`/recipe/${recipe.id}`}> — NO state passed
  └─ renders reason as visible text — CONFIRMED working

RecipeDetail.tsx
  └─ reads id from useParams()
  └─ loads recipe from IndexedDB — CONFIRMED
  └─ renders title, metadata, tips, ingredients, steps
  └─ "Why this fits you" — NOT RENDERED — CONFIRMED GAP

CookingMode.tsx
  └─ reads id from useParams()
  └─ Groceries stage needs ingredient.category
       └─ category is optional in Ingredient type — CONFIRMED
       └─ NO seed recipe has category set — CONFIRMED GAP
  └─ calls classifyGroceries agent to group items — [ASSUMED] fallback behavior TBD
```

### 2.2 Profile-Only Path (direct nav to /recipes)

```
Home.tsx
  └─ useLocation().state is null → hasSession = false
  └─ useSmartSuggestions receives null energy + null note
       └─ EARLY RETURN at line 38: if (!energyLabel && !note) return
       └─ suggestions = [] always
  └─ suggestion section is NOT rendered (guarded by hasSession)
  └─ full recipe list IS rendered with toolbar + search

STATUS: Not profile-filtered — shows all recipes.
This is by design (the heading reads "My Recipes" not "Suggestions").
The profile-only filtered recommendation path does NOT exist for direct nav.
This is a design gap, not a bug — but it means the "profile-only fallback"
claim in the MVP plan is only true when Landing is used as the entry point.
```

---

## 3. Interface Contract Gaps

### 3.1 Router State: reasons[] not threaded to RecipeDetail [CONFIRMED GAP]

**Trace:**
- `runSuggestionAgent()` → `SmartSuggestion { recipe, reason: string, isSmart: boolean }`
- `runSuggestionAgentWithFallback()` fallback → passes only `matchReasons[0]` as `reason` (line 151 in suggestionAgent.ts)
- `RecipeCard` receives `reason: string` (singular) — renders correctly on the card list
- `RecipeCard → <Link to={/recipe/${id}}>` — passes **zero state** to RecipeDetail
- `RecipeDetail` reads only `useParams().id` — no way to receive reasons

**Effect:** "Why this fits you" can never appear on RecipeDetail in its current wiring.

**Fix scope:** Two options:
- A) Pass state via `<Link state={{ reason }}>` in RecipeCard → read in RecipeDetail via `useLocation().state`
- B) Re-run `suggestRecipes()` in RecipeDetail using profile + energy from local storage

Option A is simpler and lower risk. Requires touching `RecipeCard.tsx` and `RecipeDetail.tsx` only.

**Also note:** The fallback drops `matchReasons[2..n]` — RecipeDetail would only ever show one reason even with Option A. If full reasons are needed, the `SmartSuggestion` interface would need to carry `reasons: string[]` instead of (or alongside) `reason: string`.

---

### 3.2 Ingredient `category` field: type exists, data absent [CONFIRMED GAP]

**Trace:**
- `Ingredient.category?: GroceryCategory` — optional, declared in `src/types/recipe.ts` lines 41
- `GroceryCategory` union covers 11 values: Produce, Protein, Dairy, Pantry, Spices & Seasonings, Oils & Vinegars, Canned & Jarred, Frozen, Bakery, Beverages, Other
- All 6 demo recipes in `src/storage/seed.ts` — zero ingredients have `category` set

**Effect:** CookingMode Groceries stage will either:
- Call `classifyGroceries` AI agent to classify at runtime (uses API credits, may fail offline), OR
- Group everything as "Other"

**Fix:** Add `category` to all seed ingredients. ~35 ingredient entries across 6 recipes.

---

### 3.3 `SmartSuggestion` type asymmetry

`suggestionAgent.ts` exports `SmartSuggestion` with `reason: string` (singular).
`suggestRecipes.ts` exports `SuggestedRecipe` with `matchReasons: string[]` (plural array).

These are two separate types used in two separate contexts. The bridge in the fallback path (line 151: `s.matchReasons[0] ?? ""`) discards reasons 1-N. This is a **data loss point** — the rule-based engine may generate 3-4 informative reasons but only the first reaches the UI.

This isn't a crash bug, but it means the fallback path (which runs offline and without API key) is less informative than it could be.

---

## 4. Data Model Integrity

### 4.1 `RecipeJSON` — type vs. runtime completeness

| Field | Type contract | Seed data | AI-extracted |
|-------|--------------|-----------|--------------|
| `id` | required string | ✓ | ✓ |
| `title` | required string | ✓ | ✓ |
| `preamble.tips` | required string[] | ✓ | [VERIFY] |
| `preamble.substitutions` | required array | ✓ | [VERIFY] |
| `steps[].isCritical` | required boolean | ✓ | [VERIFY] |
| `metadata.cognitiveScore` | optional 1\|2\|3 | ✓ all set | [VERIFY — may be null] |
| `ingredients[].category` | optional GroceryCategory | ✗ all missing | may be set |

**Risk:** `cognitiveScore` is optional in the type but the hard filter in `suggestRecipes.ts` line 288 drops recipes where `cs == null`. AI-extracted recipes that don't set `cognitiveScore` will **never appear in suggestions**. This is silent filtering — no error, no user feedback.

### 4.2 `UserProfile` — fields used vs. fields matched

`suggestRecipes.ts` explicitly documents which profile fields it does NOT yet match (lines 21-26):
```
dietPattern, budgetLevel, prepAssistPreferences, mobilityLimits, dexterityLimits
```
These require recipe-level tags to be added. This is **by design** and documented — no gap, but worth knowing for future iterations.

---

## 5. Resilience and Fallback Coverage

| Scenario | Behavior | Status |
|----------|----------|--------|
| API key not set | `runSuggestionAgent` throws → caught → `suggestRecipes` fallback | ✓ Handled |
| LLM call fails (network/rate limit) | caught → `suggestRecipes` fallback | ✓ Handled |
| LLM returns hallucinated IDs (all fail validation) | empty array → falls through to pure function | ✓ Handled (line 142-143) |
| LLM returns 0 valid suggestions | falls through to pure function | ✓ Handled |
| All recipes hard-filtered out | suggestion section shows "No recipes matched" + browse all button | ✓ Handled (Home.tsx line 161) |
| 0 recipes in IndexedDB | empty state UI with "Add your first recipe" link | ✓ Handled (Home.tsx line 197) |
| Search returns 0 results | "No recipes match your search" + Clear all filters button | ✓ Handled (Home.tsx line 249) |
| Recipe not found in IndexedDB | "We couldn't find that recipe" + Back to recipes link | ✓ Handled (RecipeDetail.tsx line 32) |
| Extraction agent fails | [VERIFY — useRecipeExtraction hook state machine] | ? |
| Offline scraper call | queued via src/storage/queue.ts | ✓ Designed |

---

## 6. Build System Health

### 6.1 Potential TypeScript issue in RecipeDetail.tsx [VERIFY]

`extractedDate` is declared at line 43 but the truncated file preview doesn't show it used in the render. If it's declared but unused, `tsc -b` will error. This needs a live build run to confirm.

**Quick check:** `pnpm build` — if it passes, no issue.

### 6.2 Windows/SETUP.md — local changes not committed

File is modified locally (path anonymized) but not committed. This is an untracked local change that will be lost if someone runs `git checkout .`.

### 6.3 pnpm-lock.yaml — resolved after stash pop

The lock file was stashed, the remote version merged in cleanly. The working tree is clean on this file. Run `pnpm install` to ensure node_modules matches the new lock file.

---

## 7. Infrastructure Alignment

### 7.1 README mentions `api/fetch-recipe.ts` — actual file is `api/scrape-recipe.py` [CONFIRMED]

README.md line 36: `"Backend: Vercel serverless function (api/fetch-recipe.ts)"`
Actual file: `api/scrape-recipe.py`

This is a stale reference — likely from an earlier design. The Python scraper is what actually runs. The `vercel.json` config should be verified to ensure it routes `/api/scrape-recipe` to the Python runtime correctly. **[VERIFY: check vercel.json]**

### 7.2 `dangerouslyAllowBrowser: true` in OpenAI client

`suggestionAgent.ts` line 88 and `recipeAgent.ts` (assumed) both use `dangerouslyAllowBrowser: true`. This is required for the current client-side AI approach. The API key is exposed in the JS bundle. This is documented as a known risk — mitigation is spending cap on the key.

---

## 8. Integration Gaps Summary — Priority Order

| # | Gap | Severity | File(s) | Fix Complexity |
|---|-----|----------|---------|----------------|
| 1 | "Why this fits you" not threaded to RecipeDetail | High — breaks named demo step | `RecipeCard.tsx`, `RecipeDetail.tsx` | Low (add Link state + read location.state) |
| 2 | Ingredient `category` missing from all seed data | High — grocery aisle grouping broken | `src/storage/seed.ts` | Low (data entry) |
| 3 | Profile-only path on direct `/recipes` nav shows all recipes, not filtered | Medium — design gap, not crash | `Home.tsx`, `useSmartSuggestions.ts` | Medium (would need profile-aware suggestion call without session) |
| 4 | AI-extracted recipes with null `cognitiveScore` silently excluded from suggestions | Medium — silent data quality failure | `suggestRecipes.ts`, `recipeAgent.ts` tools | Medium (add score computation or default) |
| 5 | README references `api/fetch-recipe.ts` (does not exist) | Low — doc error | `README.md` | Trivial |
| 6 | `matchReasons[1..n]` dropped in fallback path — only first reason surfaces | Low — information loss, not crash | `suggestionAgent.ts` line 151 | Low (widen SmartSuggestion or pass full array) |
| 7 | `Windows/SETUP.md` anonymization not committed | Low — local only | Git | Trivial (commit + push) |

---

## 9. Verification Checklist (Run Before Demo)

```bash
# 1. Build integrity
pnpm build                     # Should complete with 0 TypeScript errors

# 2. Lint integrity
pnpm lint                      # No ESLint or stylelint violations

# 3. Unit tests
pnpm test                      # suggestRecipes.test.ts should pass

# 4. Demo path — manual, clean browser
# Open incognito → http://localhost:5173
# → Select energy chip + type note → navigate to /recipes
# → Verify: suggestions appear with reasons visible on cards
# → Click a recipe → verify "Why this fits you" section appears on RecipeDetail
# → Click "Let's cook" → verify Groceries stage shows aisle groupings

# 5. Safety constraint test
# → Set "peanuts" allergen in Profile
# → Return to Landing → select energy → navigate to /recipes
# → Verify: Sopa de Maní is NOT in suggestions

# 6. Offline test
# → DevTools → Network → Offline
# → Verify: app loads, seed recipes visible, extract fails gracefully
```

---

## 10. What's Cohesive and Well-Engineered

These areas are well-integrated and should not be touched:

- **Hard filter pipeline** — allergen expansion, tool restriction matching, cognitive score gate are all correctly composed in `suggestRecipes.ts` and re-used by `suggestionAgent.ts` via `hardFilterRecipes()` export. Single source of truth.
- **Fallback chain** — LLM → pure function → empty state is fully handled at each layer.
- **IndexedDB schema** — stores (recipes, profile, queue, customAlarms) are versioned with upgrade paths.
- **Seed idempotency** — `seedDemoRecipes()` checks existing IDs before inserting, safe to run multiple times.
- **Accessibility scaffolding** — `aria-label`, `aria-labelledby`, `role="status"`, live regions, keyboard navigation all present in Home.tsx and RecipeDetail.tsx.
- **Error boundaries** — loading/not-found/empty states handled at every page level.
- **Type safety** — `GroceryCategory` as a union type means new categories can't be silently misspelled.
