<!-- Last updated at commit: 26eff09 (26eff093078e89e93dfd2536b65f0de122e5c15e) on 2026-03-07 | branch: main -->
# Recipe Extraction Agent Spec

## Core Functionality
- Users import recipes via URL or paste text
- An in-app agent with tool access processes the recipe and outputs structured JSON
- The agent extracts and preserves preamble content for tips, substitutions, and technique notes

## Data Processing Pipeline
- Fetch and clean raw recipe content from URLs or pasted text
- Extract preamble section and mine it for actionable insights
- Parse ingredients with quantities and units
- Extract cooking steps with timing information
- Flag critical prep requirements like overnight marinades or dough rising
- Map extracted tips and substitutions back to relevant ingredients or steps [Planned — not built]
- Identify nonstandard units like "hand of garlic" and include brief explanations
- Calculate weight conversions from volume based on ingredient density lookups, with uncertainty flags for specialty items

## Agent Tools [Built]

Each tool is a pure function in `src/agent/tools/`. All tools are registered in `src/agent/toolDefinitions.ts` via `toOpenAITools()`.

| Tool | File | Status | Description |
|------|------|--------|-------------|
| `extract_preamble` | `extractPreamble.ts` | Built | Extract tips, substitutions, technique notes from preamble text |
| `parse_ingredients` | `parseIngredients.ts` | Built | Parse ingredient list — assigns UUID per ingredient, builds `units[]` array, initializes empty substitutions/annotations |
| `extract_steps` | `extractSteps.ts` | Built | Extract cooking steps with timing and criticality flags — assigns UUID per step |
| `convert_volume_to_weight` | `convertVolumeToWeight.ts` | Built | Volume (cups, ml, etc.) → grams using density lookup from `densityTable.ts` (~60 entries) |
| `convert_weight_to_volume` | `convertWeightToVolume.ts` | Built | Weight (g, oz, lbs) → readable volume (cups, tbsp, tsp) for accessibility |
| `validate_output` | `validateOutput.ts` | Built | Validates assembled RecipeJSON against Zod schema — excluded from OpenAI tools list, called internally |
| `map_annotations` | — | Planned — not built | Map tips/substitutions to specific ingredients or steps |

## Output Format [Built]

Structured `RecipeJSON` with:
- **`preamble`** — `{ raw, tips[], substitutions[], techniqueNotes[] }`
- **`ingredients[]`** — each has: `id` (UUID), `raw` (verbatim), `name`, `quantity`, `unit`, `units[]`
  - `units[]` entries: `{ original, grams?, mlEquivalent?, densitySource?, confidenceLevel: "high"|"medium"|"low", explanation? }`
  - `substitutions[]`, `annotations[]` arrays (populated from preamble or agent calls)
- **`steps[]`** — each has: `id` (UUID), `index`, `text`, `timingMinutes?`, `isCritical`, `criticalNote?`
  - `annotations[]`: `{ type: "tip"|"warning"|"substitution"|"technique", text, relatedIngredientIds? }`
- **`metadata`** — `{ totalTimeMinutes?, prepTimeMinutes?, cookTimeMinutes?, servings?, cognitiveScore?, cognitiveScoreRaw?, rawText }`
- `id` (UUID) and `extractedAt` timestamp injected after agent loop completes

## Implementation Details [Built]

- **Model:** `gpt-5-nano`, temperature=1
- **Iteration cap:** 30 (`MAX_ITERATIONS` constant in `src/agent/recipeAgent.ts`)
- **Agent file:** `src/agent/recipeAgent.ts` — tool-calling loop that assembles `RecipeJSON` by copying tool outputs verbatim
- **URL fetching:** `src/agent/fetcher.ts` — fetches URL and cleans HTML via Readability before passing to agent
- **Tool schemas:** `src/agent/toolDefinitions.ts` — OpenAI function calling format via `toOpenAITools()`
- **Validation:** Zod schemas validate the full assembled structure via `validateOutput.ts`
- **Density table:** `src/lib/densityTable.ts` — ~60 ingredient densities for vol↔weight conversions

## Suggestion Agent [Built]

A separate agent for ranking recipe recommendations — not a tool loop.

- **File:** `src/agent/suggestionAgent.ts`
- **Model:** `gpt-5-nano`, temperature=0.4
- **Approach:** Single structured-output call (not an agentic loop)
- **Workflow:**
  1. Client-side hard filters applied BEFORE the LLM call (allergens, excluded ingredients, tool restrictions, cognitiveScore)
  2. Single call to rank best 1–3 recipes from the filtered list given the user's session note
  3. Falls back to pure `suggestRecipes()` (deterministic, no API) if LLM call fails or returns empty
- **Returns:** `SmartSuggestion[]` — each has recipe + matchReasons + `isSmart: boolean` flag
- **Hook:** `src/hooks/useSmartSuggestions.ts` — runs once per session when recipes + profile are loaded

## User Features [Built]
- Toggle measurement units between metric and imperial (unit toggle in `IngredientList`)
- View and toggle ingredient substitutions from preamble
- Access brief explanations for nonstandard units
- Toggle annotations and tips on steps while cooking
- Check off completed steps
- View raw recipe while offline before processing (`rawText` preserved in metadata)

## Offline and Queue System
- Users need internet to fetch recipe URLs and process recipes through the agent [Built — fetch + agent calls require network]
- Pasted recipes and URLs queue for processing when internet returns [Queue structure built in `src/storage/queue.ts`; drain logic not yet implemented]
- Users can view pasted recipes in raw format while offline [Built — `rawText` in metadata]
- Already-processed recipes display and function fully offline [Built — IndexedDB-backed]

## Storage [Built]

- **Library:** `idb` v2
- **Database name:** `simmer`
- **Version:** 2
- **4 stores:**

| Store | Key | Purpose |
|-------|-----|---------|
| `recipes` | `id` | Stores `RecipeJSON` objects |
| `queue` | `url` | Offline queue entries awaiting processing |
| `profile` | `id` | `UserProfile` with index `by_role` |
| `customAlarms` | `id` | Uploaded alarm audio blobs with metadata |

- **Files:** `src/storage/db.ts` (setup), `src/storage/recipes.ts` (CRUD), `src/storage/queue.ts` (queue), `src/storage/customAlarms.ts` (alarm blobs)

## Stretch Goal
- Extract and aggregate recipe reviews to identify common issues or tips multiple reviewers mention, then surface those as warning flags attached to relevant steps [Not built]
