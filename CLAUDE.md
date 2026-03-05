# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Simmer** — A React PWA built for the CreateHerFest Hackathon (deadline: March 7, 2026) that helps users with temporary, chronic, or permanent physical/cognitive limitations find and follow accessible recipes.

**Status:** Implementation phase — scaffold complete, building extraction agent.

## Tech Stack

- **Frontend:** React 19 + TypeScript (PWA via vite-plugin-pwa)
- **Bundler:** Vite 6
- **Styling:** Tailwind CSS 3
- **Storage:** IndexedDB via `idb`
- **AI:** OpenAI `gpt-5-nano` (temp 0.3) with function calling for recipe extraction
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

## Chrome DevTools MCP Debugging Flow

When debugging with Claude Code + Chrome DevTools MCP:

1. Start dev server with Chrome: `pnpm dev:browser`
2. In Claude Code, verify MCP is connected: `/mcp` → should show `chrome-devtools`
3. Standard debugging sequence:
   - `list_pages` → find the right page ID
   - `select_page` → focus that page
   - `take_snapshot` → read DOM state (prefer over screenshot)
   - `evaluate_script` → run JS to check element positions, state, etc.
   - `list_console_messages` with `types: ["error"]` → catch runtime errors
   - `list_network_requests` → find stuck/failed requests

**Rule:** Never declare a UI element "correct" based on a screenshot alone.
Always verify with `evaluate_script` and `getBoundingClientRect()` first.

## Related Docs

| File | Description | When to consult |
|------|-------------|-----------------|
| [docs/plans/Initial_MVP_Plan.md](docs/plans/Initial_MVP_Plan.md) | Full MVP spec, data types, two-week plan, 16 acceptance criteria | Adding features or writing code |
| [docs/plans/PLAN-RECIPE_EXTRACTION_AGENT.md](docs/plans/PLAN-RECIPE_EXTRACTION_AGENT.md) | Agent pipeline, tools, output format, offline queue | Building or modifying the AI extraction flow |
| [docs/plans/Plan_Overview_Diagram.md](docs/plans/Plan_Overview_Diagram.md) | Mermaid architecture diagrams | Understanding system flow at a glance |
| [PERPLEXITY_GUIDE.md](PERPLEXITY_GUIDE.md) | How the team uses Perplexity Enterprise for research | Before starting research tasks or looking up library docs |

<!-- a11y-agent-team: start -->
# Accessibility-First Development

This project enforces WCAG AA accessibility standards for all web UI code.

## Hook-Based Enforcement

Accessibility review is enforced by three global hooks:

1. **Proactive detection** (`UserPromptSubmit`) — Detects web projects and injects the delegation instruction on every prompt.
2. **Edit gate** (`PreToolUse`) — Blocks Edit/Write to UI files until accessibility-lead has been consulted. Uses `permissionDecision: "deny"`.
3. **Session marker** (`PostToolUse`) — Unlocks the edit gate after accessibility-lead completes.

If an edit is blocked, delegate to `accessibility-agents:accessibility-lead` first.

## Mandatory Accessibility Check

Before writing or modifying any web UI code - including HTML, JSX, CSS, React components, Tailwind classes, web pages, forms, modals, or any user-facing web content - you MUST:

1. Consider which accessibility specialist agents are needed for the task
2. Apply the relevant specialist knowledge before generating code
3. Verify the output against the appropriate checklists

**Automatic trigger detection:** If a user prompt involves creating, editing, or reviewing any file matching `*.html`, `*.jsx`, `*.tsx`, `*.vue`, `*.svelte`, `*.astro`, or `*.css` - or if the prompt describes building UI components, pages, forms, or visual elements - treat it as a web UI task and apply the Decision Matrix below.

## Available Specialist Agents

| Agent | When to Use |
|-------|------------|
| accessibility-lead | Any UI task - coordinates all specialists and runs final review |
| aria-specialist | Interactive components, custom widgets, ARIA usage |
| modal-specialist | Dialogs, drawers, popovers, overlays |
| contrast-master | Colors, themes, CSS styling, visual design |
| keyboard-navigator | Tab order, focus management, keyboard interaction |
| live-region-controller | Dynamic content updates, toasts, loading states |
| forms-specialist | Forms, inputs, validation, error handling, multi-step wizards |
| alt-text-headings | Images, alt text, SVGs, heading structure, page titles, landmarks |
| tables-data-specialist | Data tables, sortable tables, grids, comparison tables |
| link-checker | Ambiguous link text, "click here"/"read more" detection |
| cognitive-accessibility | WCAG 2.2 cognitive SC, COGA guidance, plain language |
| mobile-accessibility | React Native, Expo, iOS, Android - touch targets, screen readers |
| design-system-auditor | Color token contrast, focus ring tokens, spacing tokens |
| web-accessibility-wizard | Full guided web accessibility audit |
| document-accessibility-wizard | Document audit for .docx, .xlsx, .pptx, .pdf |
| markdown-a11y-assistant | Markdown audit - links, headings, emoji, tables |
| testing-coach | Screen reader testing, keyboard testing, automated testing |
| wcag-guide | WCAG 2.2 criteria explanations, conformance levels |

## Commands

Type `/` followed by a command name to invoke the corresponding specialist directly:

| Command | Specialist | Purpose |
|-------|-----------|---------|
| `/aria` | aria-specialist | ARIA patterns - roles, states, properties |
| `/contrast` | contrast-master | Color contrast - ratios, themes, visual design |
| `/keyboard` | keyboard-navigator | Keyboard nav - tab order, focus, shortcuts |
| `/forms` | forms-specialist | Forms - labels, validation, error handling |
| `/alt-text` | alt-text-headings | Images/headings - alt text, hierarchy, landmarks |
| `/tables` | tables-data-specialist | Tables - headers, scope, caption, sorting |
| `/links` | link-checker | Links - ambiguous text detection |
| `/modal` | modal-specialist | Modals - focus trap, return, escape |
| `/live-region` | live-region-controller | Live regions - dynamic announcements |
| `/audit` | web-accessibility-wizard | Full guided web accessibility audit |
| `/document` | document-accessibility-wizard | Document audit - Word, Excel, PPT, PDF |
| `/markdown` | markdown-a11y-assistant | Markdown audit - links, headings, emoji |
| `/test` | testing-coach | Testing - screen reader, keyboard, automated |
| `/wcag` | wcag-guide | WCAG reference - criteria explanations |
| `/cognitive` | cognitive-accessibility | Cognitive a11y - COGA, plain language |
| `/mobile` | mobile-accessibility | Mobile - React Native, touch targets |
| `/design-system` | design-system-auditor | Tokens - contrast, focus rings, spacing |

## Decision Matrix

- **New component or page:** Always apply aria-specialist + keyboard-navigator + alt-text-headings. Add forms-specialist for inputs, contrast-master for styling, modal-specialist for overlays, live-region-controller for dynamic updates, tables-data-specialist for data tables.
- **Modifying existing UI:** At minimum apply keyboard-navigator. Add others based on what changed.
- **Code review/audit:** Apply all specialist checklists. Use web-accessibility-wizard for guided audits.
- **Document audit:** Use document-accessibility-wizard for Office and PDF accessibility audits.
- **Mobile app:** Use mobile-accessibility for touch targets, labels, and screen reader compatibility.
- **Cognitive / UX clarity:** Use cognitive-accessibility for WCAG 2.2 SC 3.3.7, 3.3.8, 3.3.9, COGA guidance.
- **Design system / tokens:** Use design-system-auditor to validate color token pairs, focus ring tokens, spacing tokens.
- **Data tables:** Always apply tables-data-specialist.
- **Links:** Always apply link-checker when pages contain hyperlinks.
- **Images or media:** Always apply alt-text-headings.

## Non-Negotiable Standards

- Semantic HTML before ARIA (`<button>` not `<div role="button">`)
- One H1 per page, never skip heading levels
- Every interactive element reachable and operable by keyboard
- Text contrast 4.5:1, UI component contrast 3:1
- No information conveyed by color alone
- Focus managed on route changes, dynamic content, and deletions
- Modals trap focus and return focus on close
- Live regions for all dynamic content updates

For tasks that do not involve any user-facing web content (backend logic, scripts, database work), these requirements do not apply.


<!-- a11y-agent-team: end -->

