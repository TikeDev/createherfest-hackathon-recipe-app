# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Recipe Streamliner** — A React PWA built for the CreateHerFest Hackathon (deadline: March 7, 2026) that helps users with temporary, chronic, or permanent physical/cognitive limitations find and follow accessible recipes.

**Status:** Implementation phase — scaffold complete, building extraction agent.

## Tech Stack

- **Frontend:** React 19 + TypeScript (PWA via vite-plugin-pwa)
- **Bundler:** Vite 6
- **Styling:** Tailwind CSS 3
- **Storage:** IndexedDB via `idb`
- **AI:** OpenAI `gpt-4o-mini` (temp 0.3) with function calling for recipe extraction
- **Validation:** Zod
- **Package manager:** pnpm

## Commands

```bash
pnpm install       # Install dependencies
pnpm dev           # Start dev server
pnpm build         # Production build (tsc + vite build)
pnpm preview       # Preview production build locally
pnpm lint          # ESLint
```

## Architecture

### Core User Flow

```
User profile + optional session input (chips / text / both)
        ↓
Hard filter: block allergens, excluded ingredients, restricted tools
        ↓
Soft scoring: time, energy, appliance fit, cleanup, sensory match
        ↓
Ranked recommendations with "Why this fits you" reasons
        ↓
Recipe detail → Playbook View → step-by-step cooking mode
```

See [docs/plans/Plan_Overview_Diagram.md](docs/plans/Plan_Overview_Diagram.md) for Mermaid flow diagrams.

### Key Data Models

**`UserProfile`** — persistent settings including allergens, excluded ingredients, diet patterns, dexterity/mobility limits, tool restrictions, preferred appliances (slow cooker, air fryer, Instant Pot), sensory preferences, cognitive load level, time/budget preferences, and audio readout settings.

**`SessionState`** — optional per-session input: `chips?: SessionChip[]` and/or `note?: string`. All four combinations (chips only, text only, both, neither) are valid. Empty input triggers `profile_only` mode.

**`RecipeMetadata`** — tags for allergens, ingredients, techniques, tools, `knifeRequired`, convenience tags (pre-cut/frozen/canned), appliance tags, total minutes, step count, complexity, sensory/comfort tags, cleanup load, and optional `ingredientAlternatives` (source-provided only).

### APIs

```
POST /api/recommendations   { profileId, sessionState?, limit }
GET  /api/profile/:id
PUT  /api/profile/:id
POST /api/grocery-list      (stretch) { recipeIds, profileId? }
```

### Recipe Extraction Agent

An in-app agent (GPT-4o) processes imported recipes via URL or pasted text into structured JSON. Pipeline:
1. Fetch & clean raw content
2. Extract preamble (tips, substitutions, technique notes)
3. Parse ingredients with quantities, units, density-based weight conversions
4. Extract cooking steps with timing and criticality flags
5. Map tips/substitutions to relevant ingredients or steps
6. Validate output structure

Processed recipes are fully offline-capable via IndexedDB. Unprocessed pasted recipes are viewable offline in raw form; URL imports queue for processing when connectivity returns.

### Recommendation Logic

**Hard filter phase** — removes recipes conflicting with any hard constraint (allergens, excluded ingredients, restricted tools/techniques, strict cognitive limits). Ingredient alternatives that violate hard constraints are also filtered out.

**Soft scoring phase** — ranks remaining recipes by: time fit, energy fit, mood/comfort, sensory fit, cleanup burden, cost fit, prep accessibility (pre-cut/frozen/canned), appliance fit.

**Modes:** `profile_plus_state` (chips/text available) or `profile_only` (no session input, or user skipped unknown text with no chips).

**Unknown text intent:** Show "I'm not sure what the intent of that text is. Please clarify or skip." with `Clarify` (default) and `Skip this text and continue` actions.

**Source-faithful substitutions:** Never fabricate alternatives in MVP. Only show substitutions explicitly present in the original recipe source, and only after filtering for safety constraints.

## Safety Rules (Hard Constraints)

These must never be violated:
- Allergens are always blocked
- Excluded ingredients are always blocked
- Restricted techniques/tools are always blocked
- Unsafe ingredient alternatives (allergen/excluded) are never shown even if present in source

## Related Docs

| File | Description | When to consult |
|------|-------------|-----------------|
| [docs/plans/Initial_MVP_Plan.md](docs/plans/Initial_MVP_Plan.md) | Full MVP spec, data types, two-week plan, 16 acceptance criteria | Adding features or writing code |
| [docs/plans/PLAN-RECIPE_EXTRACTION_AGENT.md](docs/plans/PLAN-RECIPE_EXTRACTION_AGENT.md) | Agent pipeline, tools, output format, offline queue | Building or modifying the AI extraction flow |
| [docs/plans/Plan_Overview_Diagram.md](docs/plans/Plan_Overview_Diagram.md) | Mermaid architecture diagrams | Understanding system flow at a glance |
| [PERPLEXITY_GUIDE.md](PERPLEXITY_GUIDE.md) | How the team uses Perplexity Enterprise for research | Before starting research tasks or looking up library docs |
