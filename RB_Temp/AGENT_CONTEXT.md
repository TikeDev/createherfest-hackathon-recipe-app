# Context for New Claude Agent — Simmer Project

**Handoff from:** Rahul Basu (chief advisory architect), conversation with Claude Sonnet 4.6
**Repo:** https://github.com/TikeDev/createherfest-hackathon-simmer
**Branch:** main (latest commit: `1905f7f`)
**Deadline:** March 7, 2026 (hackathon submission day — today)

---

## What Is Simmer

A React 19 PWA built for the CreateHerFest #75HER Hackathon. It helps people with physical, cognitive, or temporary limitations find and follow accessible recipes. Core features:

- **Profile** — allergens, tool restrictions, mobility/dexterity limits, preferred appliances, cognitive load setting
- **Recommendation engine** — two-stage: hard filters (allergens, tools, cognitive score) + soft scoring (NL relevance, time fit, appliance fit)
- **CookingMode** — 5-stage Playbook View: Groceries → Pre-Prep → Prep → Cook → Serve, with timer alarms
- **Extraction agent** — imports any recipe URL or pasted text via gpt-5-nano function calling
- **IndexedDB offline storage** — all data stays in the browser (recipes, profile, queue, custom alarms)
- **Vercel deployment** — Python scraper proxy at `api/scrape-recipe.py`

**Tech stack:** React 19 + TypeScript + Vite 6 + Tailwind CSS 3 + idb + OpenAI SDK + Zod + pnpm

---

## Repo Structure (Key Files)

```
src/
  agent/
    recipeAgent.ts          # Extraction agent loop (gpt-5-nano, temp=1 ← BUG, 30 iter)
    suggestionAgent.ts      # Single-call LLM ranker + rule-based fallback
    classifyGroceries.ts    # Grocery category classifier (assumed gpt-5-nano)
  lib/
    suggestRecipes.ts       # Pure deterministic recommendation engine
  pages/
    Landing.tsx             # Energy chip + free-text note → navigate to /recipes
    Home.tsx                # Loads suggestions via useSmartSuggestions hook
    RecipeDetail.tsx        # Shows recipe — MISSING "Why this fits you" section
    CookingMode.tsx         # 5-stage playbook + timers
    Profile.tsx             # Accessibility settings + alarm config
  storage/
    seed.ts                 # 6 demo recipes — MISSING category on all ingredients
  types/
    recipe.ts               # RecipeJSON, Ingredient (category?: GroceryCategory), etc.
  hooks/
    useSmartSuggestions.ts  # Orchestrates LLM suggestion call
    useProfile.ts           # Profile state with isDirty/discard (recently updated)
api/
  scrape-recipe.py          # Vercel Python serverless scraper
docs/
  ARCHITECTURE.md           # Full source file map
  EVIDENCE_LOG.md           # Template — partially filled (needs completion)
  DECISION_LOG.md           # Template — partially filled (needs completion)
  RISK_LOG.md               # Template — EMPTY (needs 3+ entries)
  PROBLEM_FRAME.md          # DONE — 4-line problem frame filled in
RB_Temp/                    # Advisory docs (not production code)
  score-maximizing-plan.md
  systems-engineering-assessment.md
  model-selection-analysis.md
  AGENT_CONTEXT.md          # This file
```

---

## Commands

```bash
pnpm install        # Install deps + initialize husky hooks
pnpm dev            # Dev server (Vite only, no /api routes)
pnpm dev:full       # Dev server + Vercel (enables /api/scrape-recipe)
pnpm build          # tsc -b && vite build (must pass before commit)
pnpm lint           # ESLint + stylelint
pnpm test           # vitest run
```

**Pre-commit hook** (`.husky/pre-commit`): runs `lint-staged` + `tsc --noEmit` on every commit. Failing TypeScript blocks the commit.

**CI** (`.github/workflows/ci.yml`): runs `pnpm build` + `pnpm lint` + `pnpm test` on every push to main.

---

## Confirmed Bugs (Code-Traced)

### P0-1 — "Why this fits you" not shown on RecipeDetail
**File:** `src/pages/RecipeDetail.tsx`
**Root cause:** `RecipeCard.tsx` renders `reason` on the card list correctly, but its `<Link to={/recipe/${id}}>` passes **no router state**. `RecipeDetail` reads only `useParams().id` — no mechanism to receive reasons.
**Fix:** In `RecipeCard.tsx`, change the Link to:
```tsx
<Link to={`/recipe/${recipe.id}`} state={{ reason }}>
```
In `RecipeDetail.tsx`, read via:
```tsx
const { reason } = (useLocation().state as { reason?: string }) ?? {};
```
Then render a "Why this fits you" section above the CTA button when `reason` is present.

### P0-2 — Ingredient `category` missing from all seed recipes
**File:** `src/storage/seed.ts`
**Root cause:** `Ingredient.category?: GroceryCategory` is typed correctly but zero of the ~50 ingredients across 6 demo recipes have it set. CookingMode Groceries stage groups by category — without it, all items fall to "Other" or the AI classifier is called.
**Fix:** Add `category: "Produce" | "Protein" | ...` to every ingredient in all 6 recipes.

### P0-3 — `temp=1` on extraction agent
**File:** `src/agent/recipeAgent.ts`
**Root cause:** High temperature on a structured data extraction task increases random variation — exactly the opposite of what schema-adherent function calling needs.
**Fix:** Change `temperature: 1` → `temperature: 0.1`

---

## Known Design Gaps (Not Bugs)

- **Profile-only path** — navigating directly to `/recipes` (skipping Landing) shows all recipes, not profile-filtered suggestions. `useSmartSuggestions` exits early when `!energyLabel && !note`. By design but worth noting.
- **`matchReasons[1..n]` dropped** — fallback path in `suggestionAgent.ts` line 151 only passes `matchReasons[0]` as `reason`. Full reasons array is discarded.
- **AI-extracted recipes with null `cognitiveScore`** — silently excluded from suggestions by the hard filter. No user feedback.

---

## Documentation Gaps (Submission Risk)

The judging criteria (see `judging_criteria.md`) weights 55% on communication. These docs are templates that need real content:

| File | Status | What's needed |
|------|--------|---------------|
| `docs/EVIDENCE_LOG.md` | Template, 2 rows filled | All npm/pip deps listed, 3+ research citations, AI tool log |
| `docs/DECISION_LOG.md` | Partially filled | Key architecture decisions filled in (many `[Decision]` placeholders) |
| `docs/RISK_LOG.md` | Completely empty | At least 3 risks documented (API key exposure, temp=1 issue, agentic failure) |
| `README.md` | Mostly complete | Team roles/GitHub/LinkedIn still `[Role]`/`[@username]`; Demo Video + Live Demo links missing |

`docs/PROBLEM_FRAME.md` is fully complete — use it as source material for README top section.

---

## Model Architecture Issues (See `RB_Temp/model-selection-analysis.md`)

All 3 AI tasks use `gpt-5-nano` uniformly. Task-appropriate recommendations:

| Task | File | Current | Recommended |
|------|------|---------|-------------|
| Extraction agent (30-iter agentic loop) | `recipeAgent.ts` | gpt-5-nano, temp=1 | Claude Haiku 4.5, temp=0.1 |
| Suggestion agent (single call, UX copy) | `suggestionAgent.ts` | gpt-5-nano, temp=0.4 | Claude Haiku 4.5 or gpt-5-mini |
| Grocery classifier (11-label enum) | `classifyGroceries.ts` | gpt-5-nano (assumed) | Replace with keyword lookup table |

---

## Judging Criteria Summary

| Criterion | Weight | Current Status |
|-----------|--------|----------------|
| Clarity | 25% | Good app — Problem Frame done. README missing 4-line frame at top. |
| Proof | 25% | P0 bugs break demo. Evidence Log nearly empty. |
| Usability | 20% | App has aria-labels, keyboard nav. README readability needs pass. |
| Rigor | 20% | Decision Log partial. Risk Log empty. SDG alignment not written. |
| Polish | 10% | .env.example exists. README placeholders unfilled. |

---

## Recommended Execution Order (Remaining Work)

```
1. pnpm install                          # Initialize husky hook
2. Fix temp=1 in recipeAgent.ts          # Single line, immediate reliability gain
3. Add category to seed.ts ingredients  # ~50 data entries, fixes Groceries stage
4. Thread reason into RecipeDetail       # 2-file change, fixes core demo step
5. Fill docs/RISK_LOG.md                 # 3 entries minimum
6. Fill docs/EVIDENCE_LOG.md            # All deps + 3 research citations
7. Complete docs/DECISION_LOG.md        # Fill [Decision] placeholders
8. Add Problem Frame to top of README   # Copy from PROBLEM_FRAME.md
9. Fill README team/link placeholders   # Roles, GitHub, LinkedIn, demo video
10. pnpm build && pnpm test             # Verify clean before final commit
11. Record demo video (incognito)       # Clean-state run
```

---

## What NOT to Touch

- `src/lib/suggestRecipes.ts` — hard filter + soft scoring engine is well-designed, do not refactor
- `src/agent/suggestionAgent.ts` — fallback chain (LLM → pure function) is correct, only model/temp changes if anything
- `src/storage/db.ts` — IndexedDB schema is versioned, do not modify without understanding migration paths
- `.github/workflows/ci.yml` and `.husky/pre-commit` — CI/hooks just added, leave intact
