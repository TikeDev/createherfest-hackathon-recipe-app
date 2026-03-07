<!-- Last updated at commit: 26eff09 (26eff093078e89e93dfd2536b65f0de122e5c15e) on 2026-03-07 | branch: main -->
# CLAUDE.md

## Project Overview

**Simmer** — A React PWA built for the CreateHerFest Hackathon (deadline: March 7, 2026) that helps users with temporary, chronic, or permanent physical/cognitive limitations find and follow accessible recipes.

**Status:** Feature-complete MVP — extraction agent, recommendation engine, cooking mode with timer alarms, and profile all built. Deadline: March 7, 2026.

## Tech Stack

- **Frontend:** React 19 + TypeScript (PWA via vite-plugin-pwa)
- **Bundler:** Vite 6
- **Styling:** Tailwind CSS 3
- **Storage:** IndexedDB via `idb`
- **AI:** OpenAI `gpt-5-nano` — recipeAgent (temp=1), suggestionAgent (temp=0.4)
- **Validation:** Zod
- **Package manager:** pnpm

## Commands

```bash
pnpm install       # Install dependencies
pnpm dev           # Start dev server (Vite only)
pnpm dev:full      # Start dev server with Vercel (enables /api routes)
pnpm dev:browser   # dev:full + launch Chrome Beta automatically
pnpm build         # Production build (tsc + vite build)
pnpm preview       # Preview production build locally
pnpm lint          # ESLint + stylelint
pnpm test          # Run vitest (unit tests)
pnpm test:watch    # Run vitest in watch mode
```

## Icons

Default to **[Lucide React](https://lucide.dev/guide/packages/lucide-react)** for all icons — accessible, tree-shakeable, 24×24 grid, works with Tailwind. `import { Heart, Search } from 'lucide-react'`

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the user flow diagram and full source file map.

### Pages & Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Landing` | Entry point — energy level selection + note |
| `/recipes` | `Home` | Ranked recipe suggestions |
| `/extract` | `Extract` | URL/text → AI extraction agent |
| `/recipe/:id` | `RecipeDetail` | Ingredients (unit toggle) + steps |
| `/cook/:id` | `CookingMode` | Step-by-step mode with timer, alarms, grocery list |
| `/profile` | `Profile` | Accessibility preferences + timer alarm settings |

## Browser / DevTools

**Default browser is Chrome Beta.** Never open a new browser window or tab. See [docs/CHROME_DEVTOOLS_MCP_ONBOARDING.md](docs/CHROME_DEVTOOLS_MCP_ONBOARDING.md) for debugging sequences and anti-patterns.

## Related Docs

| File | Description | When to consult |
|------|-------------|-----------------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | User flow diagram + full source file map | Finding the right file to edit, understanding module structure |
| [docs/plans/Initial_MVP_Plan.md](docs/plans/Initial_MVP_Plan.md) | Full MVP spec, data types, 16 acceptance criteria | Adding features or writing code |
| [docs/plans/PLAN-RECIPE_EXTRACTION_AGENT.md](docs/plans/PLAN-RECIPE_EXTRACTION_AGENT.md) | Agent pipeline, tools, output format, offline queue | Building or modifying the AI extraction flow |
| [docs/plans/Plan_Overview_Diagram.md](docs/plans/Plan_Overview_Diagram.md) | Mermaid architecture diagrams | Understanding system flow at a glance |
| [PERPLEXITY_GUIDE.md](PERPLEXITY_GUIDE.md) | How the team uses Perplexity Enterprise for research | Before starting research tasks or looking up library docs |
| [docs/CHROME_DEVTOOLS_MCP_ONBOARDING.md](docs/CHROME_DEVTOOLS_MCP_ONBOARDING.md) | DevTools MCP patterns, debugging sequences, anti-patterns | Debugging UI, inspecting DOM/console/network |
| [docs/TEAM_SETUP.md](docs/TEAM_SETUP.md) | Accessibility agent usage tips, tool setup, DevTools MCP install | Building or reviewing UI components, onboarding |
| [docs/ALARM_FEATURE_CONTEXT.md](docs/ALARM_FEATURE_CONTEXT.md) | Timer alarm feature — full context, schema, and UX | Working on CookingMode timers or Profile alarm settings |
| [docs/PHASE_5_QUICK_START.md](docs/PHASE_5_QUICK_START.md) | Phase 5 quick-start: alarm logic in CookingMode | Continuing alarm feature development |

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) — Token-Optimized Commands

**Always prefix commands with `rtk`** — it filters output for token savings and passes through unknown commands unchanged.

```bash
# Even in chains:
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## Key Commands

```bash
# Build & test
rtk tsc                 # TypeScript errors only (83% savings)
rtk lint                # ESLint violations grouped (84%)
rtk vitest run          # Vitest failures only (99.5%)

# Git
rtk git status          # Compact status
rtk git log             # Compact log
rtk git diff            # Compact diff (80%)
rtk git add/commit/push # Ultra-compact confirmations

# JS Tooling
rtk pnpm install        # Compact install output (90%)
rtk pnpm list           # Compact dependency tree

# Meta
rtk gain                # View token savings stats
rtk gain --history      # Command history with savings
rtk discover            # Find missed RTK opportunities
```

Run `rtk init` for the full command reference.
<!-- /rtk-instructions -->
