# CLAUDE.md

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

## Icons

**Default to [Lucide React](https://lucide.dev/guide/packages/lucide-react) for all icons.** Lucide provides accessible, consistent, and lightweight SVG icons with built-in React components.

```tsx
import { Heart, Search, Menu } from 'lucide-react';

// Icons inherit currentColor and accept size prop
<Heart className="text-red-500" size={24} />
```

**Why Lucide:**
- Accessible by default (proper SVG structure, aria-hidden when decorative)
- Tree-shakeable — only imports icons you use
- Consistent 24×24 grid, 2px stroke
- Works seamlessly with Tailwind for color/size

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

See [docs/plans/Plan_Overview_Diagram.md](docs/plans/Plan_Overview_Diagram.md) for Mermaid flow diagrams. Full data models, API routes, recommendation logic, and safety rules are in [docs/plans/Initial_MVP_Plan.md](docs/plans/Initial_MVP_Plan.md). Extraction agent pipeline details are in [docs/plans/PLAN-RECIPE_EXTRACTION_AGENT.md](docs/plans/PLAN-RECIPE_EXTRACTION_AGENT.md).

## Browser / DevTools

**Default browser is Chrome Beta.** Never open a new browser window or tab. See [docs/CHROME_DEVTOOLS_MCP_ONBOARDING.md](docs/CHROME_DEVTOOLS_MCP_ONBOARDING.md) for debugging sequences, anti-patterns, and the standard debugging order.

## Related Docs

| File | Description | When to consult |
|------|-------------|-----------------|
| [docs/plans/Initial_MVP_Plan.md](docs/plans/Initial_MVP_Plan.md) | Full MVP spec, data types, two-week plan, 16 acceptance criteria | Adding features or writing code |
| [docs/plans/PLAN-RECIPE_EXTRACTION_AGENT.md](docs/plans/PLAN-RECIPE_EXTRACTION_AGENT.md) | Agent pipeline, tools, output format, offline queue | Building or modifying the AI extraction flow |
| [docs/plans/Plan_Overview_Diagram.md](docs/plans/Plan_Overview_Diagram.md) | Mermaid architecture diagrams | Understanding system flow at a glance |
| [PERPLEXITY_GUIDE.md](PERPLEXITY_GUIDE.md) | How the team uses Perplexity Enterprise for research | Before starting research tasks or looking up library docs |
| [docs/CHROME_DEVTOOLS_MCP_ONBOARDING.md](docs/CHROME_DEVTOOLS_MCP_ONBOARDING.md) | DevTools MCP patterns, debugging sequences, anti-patterns | Debugging UI, inspecting DOM/console/network, verifying element position |
| [docs/TEAM_SETUP.md](docs/TEAM_SETUP.md) | Accessibility agent usage tips, tool setup, DevTools MCP install | Building or reviewing UI components, onboarding, re-enabling a11y hooks |

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (90-99% savings)
```bash
rtk cargo test          # Cargo test failures only (90%)
rtk vitest run          # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)
```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%)
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)
```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)
```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category | Commands | Typical Savings |
|----------|----------|-----------------|
| Tests | vitest, playwright, cargo test | 90-99% |
| Build | next, tsc, lint, prettier | 70-87% |
| Git | status, log, diff, add, commit | 59-80% |
| GitHub | gh pr, gh run, gh issue | 26-87% |
| Package Managers | pnpm, npm, npx | 70-90% |
| Files | ls, read, grep, find | 60-75% |
| Infrastructure | docker, kubectl | 85% |
| Network | curl, wget | 65-70% |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->
