---
description: Analyze the codebase and update all documentation files (CLAUDE.md, Plan_Overview_Diagram.md, PLAN-RECIPE_EXTRACTION_AGENT.md, Initial_MVP_Plan.md)
---

# Update Documentation

You are tasked with updating the project documentation files to reflect the current state of the codebase.

## Files to Update

1. **CLAUDE.md** — Main guidance file for Claude Code
2. **docs/plans/Plan_Overview_Diagram.md** — Mermaid flow diagrams for system architecture
3. **docs/plans/PLAN-RECIPE_EXTRACTION_AGENT.md** — Recipe extraction agent pipeline spec
4. **docs/plans/Initial_MVP_Plan.md** — MVP spec and data types (annotate implemented items; do not restructure)

> **Out of scope:** DECISION_LOG.md, RISK_LOG.md, and EVIDENCE_LOG.md all have their own dedicated commands.

---

## Instructions

### Step 0: Check What Has Changed Since Last Update

Before analyzing the codebase, use git to understand what has changed:

```bash
# Get the current HEAD commit (will be stamped into docs later)
git log -1 --format="%H %ci" HEAD
```

```bash
# Get the last time documentation files were updated
git log -1 --format="%H %ci" -- CLAUDE.md docs/plans/Plan_Overview_Diagram.md docs/plans/PLAN-RECIPE_EXTRACTION_AGENT.md docs/plans/Initial_MVP_Plan.md
```

Also check if the doc files already have a commit stamp at the top (look for `<!-- Last updated at commit:`). If they do, use that commit hash to determine what changed since the last doc update.

Then check what has changed in the codebase since that date:

```bash
# List files changed since last doc update (use the commit hash from above)
git diff <commit-hash> --name-status
git log <commit-hash>..HEAD --oneline --no-merges
```

**Analyze the changes:**
- Which files were added, modified, or deleted?
- Which areas of the codebase changed most (agent, storage, components, pages)?
- Are there new features, refactors, or bug fixes that need documentation?

---

### Step 1: Analyze Current Codebase

Before updating any docs, thoroughly explore:

**AI Agent (`src/agent/`):**
- `recipeAgent.ts` — Agent loop: model, iteration cap, tool dispatch logic
- `fetcher.ts` — URL fetch + Readability cleaning
- `toolDefinitions.ts` — OpenAI function schemas (what tools are registered)
- `tools/` — Pure tool implementations (one file per tool)

**Storage (`src/storage/`):**
- `db.ts` — IndexedDB setup: store names, schema, version
- `recipes.ts` — CRUD operations

**Hooks (`src/hooks/`):**
- `useRecipeExtraction.ts` — State machine for extraction flow
- Any other hooks added

**Components (`src/components/`):**
- `extraction/` — RecipeInput, ExtractionProgress
- `recipe/` — IngredientList (unit toggle), StepList (checkboxes)
- `ui/` — shadcn + custom UI components

**Pages (`src/pages/`):**
- Home, Extract, RecipeDetail, CookingMode — what exists, what each renders

**Types (`src/types/`):**
- All TypeScript interfaces and their current shape

**Utilities (`src/lib/`):**
- `densityTable.ts` — ingredient density map (how many entries?)
- Other utilities

**Vercel Serverless (`api/`):**
- `fetch-recipe.ts` — CORS proxy: what it accepts, what it returns

---

### Step 2: Update Each File

For each documentation file:

1. **Read the existing content**
2. **Compare with current codebase** — identify outdated sections
3. **Update outdated sections** — keep the same style and format
4. **Add new sections** — for new features or patterns discovered
5. **Remove obsolete content** — that no longer exists in the codebase

---

### Step 3: Specific Updates Per File

**CLAUDE.md:**
- Update the **Status** line (e.g., "CookingMode complete, building recommendation engine")
- Update the **Architecture** section if new pages or hooks exist
- Update the **Key Data Models** section if interfaces changed
- Update the **APIs** section if any new Vercel functions were added
- Update the **Recipe Extraction Agent** section if the pipeline or model changed
- Update the **Related Docs** table if new docs were added
- Keep under 300 lines; if content grows, extract to a new doc and link it

**docs/plans/Plan_Overview_Diagram.md:**
- Update Mermaid diagrams if the user flow changed (new pages, new steps, new branches)
- Verify all diagram node labels match current page/component names
- Add a diagram for CookingMode if one doesn't exist yet

**docs/plans/PLAN-RECIPE_EXTRACTION_AGENT.md:**
- Update the tool list if tools were added, renamed, or removed from `src/agent/tools/`
- Update function schemas if `toolDefinitions.ts` changed
- Update the agent loop description if `recipeAgent.ts` logic changed (model, iteration cap, error handling)
- Update offline queue section if `db.ts` queue logic changed
- Do **not** remove spec sections for tools that are planned but not yet built — mark them as `[Planned]` or `[Built]`

**docs/plans/Initial_MVP_Plan.md:**
- **Do not restructure.** This is a spec document.
- Add `[✓ Implemented]` annotations next to acceptance criteria or features that are now built
- Add `[In Progress]` for items currently being built
- Do not delete any acceptance criteria, even if implemented

---

### Step 4: Stamp Each Doc with Current Branch and Commit

After updating each documentation file, add or update a commit stamp comment as the **very first line** of the file.

**Format:**
```
<!-- Last updated at commit: <short-hash> (<full-hash>) on <date> | branch: <branch-name> -->
```

**Example:**
```
<!-- Last updated at commit: 356e69c (356e69ca2f8...) on 2026-03-04 | branch: main -->
```

Get the values by running:
```bash
git log -1 --format="%h %H %cs" HEAD
git rev-parse --abbrev-ref HEAD
```

If the file already has a `<!-- Last updated at commit:` line at the top, **replace it** with the new one. Otherwise, **insert it** as the first line.

Do this for **every** doc file you update.

---

### Step 5: Validation

After updates, ensure:
- All Mermaid diagrams are valid syntax (no unclosed brackets, correct diagram type keywords)
- All file paths referenced in docs actually exist in the codebase
- Commands listed in CLAUDE.md actually appear in `package.json`
- No placeholder text (like `<your-value-here>`) remains
- Every updated doc file has the commit stamp as its first line
- CLAUDE.md is under 300 lines

---

## Output

Provide a summary in the following format:

### 📊 Changes Since Last Documentation Update

**Last Updated:** [Date and commit hash]

**Codebase Changes:**
- X files modified, Y files added, Z files deleted
- Main areas of change: [e.g., "Pages: CookingMode added", "Agent: new tool added"]
- Key commits since last update:
  - `[hash]`: [message]

### 📝 Documentation Updates Made

For each updated file:

**[FILENAME]:**
- ✅ **Added:** [New sections or content]
- ✏️ **Updated:** [Sections modified]
- ❌ **Removed:** [Obsolete content removed]
- ⚠️ **Needs Attention:** [Anything requiring manual review]

### 🎯 Summary

[High-level overview of the documentation updates]

**Recommendation:** [Suggestions for future improvements or areas needing more detail]
