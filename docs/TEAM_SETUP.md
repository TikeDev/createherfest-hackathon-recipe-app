# Team Setup Guide

## Table of Contents
- [⚡ RTK (Token Optimizer)](#-rtk-token-optimizer)
- [♿ Accessibility Agents (manual invocation)](#-accessibility-agents-manual-invocation)
- [How to use accessibility agents](#how-to-use-accessibility-agents)
- [Tips from using the agents](#tips-from-using-the-agents)
- [Re-enabling automatic hooks (optional)](#re-enabling-automatic-hooks-optional)
- [📄 Updating Documentation](#-updating-documentation)
- [🎨 Claude Code Figma Plugin (MCP + Skills)](#-claude-code-figma-plugin-mcp--skills)
- [🔍 Chrome DevTools MCP](#-chrome-devtools-mcp)
- [Option A: Chrome Beta (Mac/Windows)](#option-a-chrome-beta-macwindows)
- [Option B: Brave on Windows (untested)](#option-b-brave-on-windows-untested)

---

## ⚡ RTK (Token Optimizer)

RTK strips noise from dev command output before it reaches Claude Code — **60–90% fewer tokens** on git, build, test, and package manager commands. Install it per machine.

1. **Install** — see [github.com/rtk-ai/rtk](https://github.com/rtk-ai/rtk) for the latest method
2. **Wire the hook** — `rtk init --global` (works across all your projects)
3. **Verify** — `rtk --version` and `rtk gain` should both work

After that, Claude Code uses RTK automatically. You can also prefix commands manually: `rtk git status`, `rtk tsc`, etc.

> **macOS:** If `rtk gain` fails, you may have a different `rtk` binary on your PATH. Run `which rtk` to confirm.

---

## ♿ Accessibility Agents (manual invocation)

Simmer is built for users with physical and cognitive disabilities. Accessibility isn't a nice-to-have — it's the core product requirement, otherwise we're failing the people we're building it for.

### Why we switched from automatic hooks

We previously enforced accessibility via Claude Code hooks that automatically blocked UI edits until an accessibility-lead agent reviewed them. This worked well for quality, but consumed a lot of tokens on every single prompt — even for small tweaks or non-visual changes. With the hackathon deadline approaching, we switched to manual invocation to save tokens while keeping the same agents available.

### How to use accessibility agents

Invoke them with slash commands in Claude Code when you're working on UI:

| Command | What it checks | Use when... |
|---------|---------------|-------------|
| `/aria` | ARIA roles, states, properties | Building custom widgets, interactive components |
| `/contrast` | Color contrast ratios, visual design | Choosing colors, creating themes, dark mode |
| `/keyboard` | Tab order, focus management, shortcuts | Adding interactive elements, navigation |
| `/forms` | Labels, validation, error handling | Building any form or input |
| `/modal` | Focus trap, escape, return focus | Adding dialogs, drawers, overlays |
| `/alt-text` | Image alt text, heading hierarchy | Adding images, SVGs, headings |
| `/live-region` | Dynamic content announcements | Toasts, loading states, AJAX updates |
| `/tables` | Table headers, scope, caption | Any data table |
| `/links` | Ambiguous link text detection | Pages with hyperlinks |
| `/cognitive` | Plain language, COGA guidance | UX clarity, cognitive load review |
| `/audit` | **Full WCAG audit** (all domains) | Pre-ship comprehensive review |

**Rule of thumb:** Use specific commands for targeted checks during development. Use `/audit` for a comprehensive review before shipping or merging a PR with significant UI changes.

### Tips from using the agents

These are patterns we've learned from running the agents on this codebase:

- **`/audit` is thorough but token-heavy** — it orchestrates every specialist agent. Save it for batch reviews or pre-ship passes. In one audit of SidePanel, CookingMode, and ThemeToggle it caught 24 issues in a single pass.
- **For new components:** run `/aria` + `/keyboard` at minimum. Add `/contrast` if it has custom colors, `/forms` if it has inputs, `/modal` if it has overlays.
- **For modifying existing UI:** `/keyboard` is usually enough unless you changed colors or added new interactive patterns.
- **Common issues the agents catch:** missing `aria-label` on icon-only buttons, heading level skips, focus not returning after modal close, low contrast on muted/placeholder text, overlapping elements on mobile viewports.
- **The agents respect your code** — they flag WCAG violations and suggest fixes but don't try to rewrite your component architecture.

### Re-enabling automatic hooks (optional)

The hook scripts are still in `.claude/hooks/`. If you prefer automatic enforcement, add these entries to your `.claude/settings.json` inside the `"hooks"` object:

```json
"PreToolUse": [
  {
    "matcher": "Edit|Write",
    "hooks": [
      {
        "type": "command",
        "command": "bash .claude/hooks/a11y-enforce-edit.sh",
        "timeout": 5000
      }
    ]
  }
],
"PostToolUse": [
  {
    "matcher": "Agent",
    "hooks": [
      {
        "type": "command",
        "command": "bash .claude/hooks/a11y-mark-reviewed.sh",
        "timeout": 5000
      }
    ]
  }
]
```

Then restart Claude Code. This will block UI file edits until you delegate to the `accessibility-lead` agent, just like before.

### Customizing

- **Sound notifications** — The settings template includes `afplay` hooks that play sounds on permission requests and task completion. These are macOS-only. Remove or replace them if you're on another OS.
- **Additional permissions** — Add Chrome DevTools MCP permissions or other tool permissions to your own `.claude/settings.local.json` (gitignored) rather than editing `settings.json`.

---

## 📄 Updating Documentation

When you add a feature, merge a PR, or make significant changes, run the update-docs command to keep the project docs in sync with the codebase.

**In Claude Code, type:**
```
/update-docs
```

This will analyze the codebase and update:
- **CLAUDE.md** — main Claude guidance (architecture, commands, status)
- **docs/plans/Plan_Overview_Diagram.md** — Mermaid flow diagrams
- **docs/plans/PLAN-RECIPE_EXTRACTION_AGENT.md** — extraction agent spec
- **docs/plans/Initial_MVP_Plan.md** — annotates implemented acceptance criteria

Each updated file gets a commit stamp so we can tell at a glance how out-of-date the docs are.

> **Not covered here:** DECISION_LOG.md, RISK_LOG.md, and EVIDENCE_LOG.md each have their own dedicated commands.

---

## 🎨 Claude Code Figma Plugin (MCP + Skills)

The Figma plugin for Claude Code lets you implement designs directly from Figma URLs, connect components via Code Connect, and generate design system rules.

### User-level install (global, recommended)

Available across all your projects:

```bash
claude plugin install figma@claude-plugins-official
```

### Project-level install

Scoped to this repo — no global install needed after cloning:

```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp --scope project
```

---

## 🔍 Chrome DevTools MCP

Gives Claude Code the ability to inspect and interact with a browser — useful for debugging the PWA, checking network requests, and testing accessibility.

> **How this project works:** Instead of letting the MCP launch its own browser, we connect it to an existing instance running with remote debugging on port 9222. The `pnpm dev:browser` script handles this for Chrome Beta.

Choose the option that matches your browser.

---

### Option A: Chrome Beta (Mac/Windows)

**Prerequisites:** Node.js v20.19+, [Chrome Beta](https://www.google.com/chrome/beta/)

#### Project-level setup

1. **Copy the MCP config template:**
```bash
cp .mcp.json.example .mcp.json
```
`.mcp.json` is gitignored — no secrets, just a port number. The template already has `--browser-url=http://127.0.0.1:9222` configured.

2. **Start Vite + Chrome Beta with remote debugging:**
```bash
pnpm dev:browser
```
This starts the dev server, waits for it to be ready, then launches Chrome Beta with `--remote-debugging-port=9222`.

3. **Restart Claude Code** so it picks up `.mcp.json`.

#### Install the MCP (if not already installed)

**User-level (global, recommended):**
```bash
claude mcp add chrome-devtools --scope user npx chrome-devtools-mcp@latest --browser-url=http://127.0.0.1:9222
```

**Project-level only:**
```bash
claude mcp add chrome-devtools --scope project npx chrome-devtools-mcp@latest --browser-url=http://127.0.0.1:9222
```

> **Note:** The `--browser-url` flag is required for this project. Without it, the MCP tries to launch its own Chrome instead of connecting to the one started by `pnpm dev:browser`.

#### Verify the install

With `pnpm dev:browser` running, ask Claude: `"Do you see the running app?"` — Claude should respond with the page at `localhost:5173`.

---

### Option B: Brave on Windows (untested)

> **Note:** These instructions have not been verified by the team. If you get this working, please update this section with any corrections!

Brave is a Chromium browser and supports the Chrome DevTools Protocol, so it works with a dedicated MCP fork: [chrome-devtools-mcp-for-brave](https://github.com/carllippert/chrome-devtools-mcp-for-brave).

**Prerequisites:** Node.js v22.12.0+, current Brave Browser

#### 1. Launch Brave with remote debugging

Create a shortcut or run this command each time before using Claude Code. The typical Brave path on Windows is:

```
"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" --remote-debugging-port=9222 --user-data-dir="%TEMP%\brave-devtools-profile"
```

`--user-data-dir` is required when enabling remote debugging. Using a separate temp profile keeps your main Brave profile unaffected.

#### 2. Start Vite + Brave with remote debugging

```bash
pnpm dev:browser:brave
```

This starts the dev server, waits for it to be ready, then launches Brave with `--remote-debugging-port=9222` and opens `localhost:5173` automatically.

Use `pnpm dev:browser:brave:fresh` instead if you want a temporary profile that auto-cleans on close.

> **Note:** Brave's executable path is hardcoded to the default Windows install location (`C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe`). If Brave is installed elsewhere, edit line 9 of `scripts\launch-brave.bat` to point to the correct path.

#### 3. Install the MCP

**User-level (global, recommended):**
```bash
claude mcp add brave-devtools --scope user npx chrome-devtools-mcp-for-brave@latest --browser-url=http://127.0.0.1:9222
```

**Project-level only:**
```bash
claude mcp add brave-devtools --scope project npx chrome-devtools-mcp-for-brave@latest --browser-url=http://127.0.0.1:9222
```

If Brave isn't detected automatically, add `--executablePath` pointing to your `brave.exe`:
```bash
claude mcp add brave-devtools --scope user npx chrome-devtools-mcp-for-brave@latest --browser-url=http://127.0.0.1:9222 --executablePath="C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
```

#### 4. Copy the MCP config template

```bash
cp .mcp.json.example .mcp.json
```

The template uses port 9222 and `--browser-url`, so it's compatible with Brave as-is. No changes needed.

#### 5. Restart Claude Code

So it picks up `.mcp.json` and the newly added MCP server.

#### Verify the install

With `pnpm dev:browser:brave` running, ask Claude: `"Do you see the running app?"` — Claude should respond with the page at `localhost:5173`.

#### If something goes wrong

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `Error: Brave not found` from the script | Brave installed in a non-default location | Edit `scripts\launch-brave.bat` line 9 to point to the actual `brave.exe` path |
| Brave opens but Claude can't see the page (`list_pages` returns nothing) | An existing Brave window was already open without remote debugging | Close all Brave windows, then re-run `pnpm dev:browser:brave` |
| Port 9222 already in use | Another Brave or Chrome instance is holding the port | Close that browser, or change the port in `launch-brave.bat` and the MCP `--browser-url` flag |
| `wait-on` times out before Brave launches | Vite took too long to start | Run `pnpm dev` and `scripts\launch-brave.bat` in two separate terminals |
| Both `brave-devtools` and `chrome-devtools` MCPs are installed | Different server names registered | They can coexist — the `.mcp.json` server name must match what was registered via `claude mcp add` |

---

## 🔍 Linting & Code Quality Setup

### Quick Start

After cloning the repo, the linting setup is ready to use:

```bash
# The prepare script runs automatically after pnpm install
# But you can run it manually to verify:
pnpm prepare
```

### What Gets Set Up Automatically

After running `pnpm install`, you'll have:

#### 🔍 **Auto-linting on Every Commit**

When you `git commit`, these linters run automatically:

- **TypeScript/TSX files** → ESLint checks and fixes → Prettier formats
- **CSS files** → Stylelint checks and fixes → Prettier formats
- **Python files** → Ruff checks and fixes → Ruff formats

**Your commit will be blocked if there are unfixable errors** - this prevents bugs from entering the codebase!

The pre-commit hook only lints **files you're actually committing**, so it's fast.

#### 📝 **Available Lint Commands**

Run these manually anytime:

```bash
# Check for issues
pnpm lint           # Lint TS/TSX and CSS
pnpm lint:py        # Lint Python files

# Auto-fix issues
pnpm lint:fix       # Fix TS/TSX and CSS issues
pnpm lint:py:fix    # Fix Python issues
```

### VS Code Setup (Highly Recommended)

#### Install Recommended Extensions

1. Open VS Code in the project directory
2. Open the command palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
3. Run: `Extensions: Show Recommended Extensions`
4. Install all 4 extensions:
   - **ESLint** (`dbaeumer.vscode-eslint`)
   - **Prettier** (`esbenp.prettier-vscode`)
   - **Stylelint** (`stylelint.vscode-stylelint`)
   - **Ruff** (`charliermarsh.ruff`)

#### What You Get with Extensions

✅ **Real-time error highlighting** as you type  
✅ **Auto-fix on save** - files are formatted and fixed automatically  
✅ **Consistent formatting** across the entire team  
✅ **Fewer surprises** at commit time

Settings are already configured in `.vscode/settings.json`.

### Understanding the Linting System

#### How It Works

This project uses a multi-layered linting approach:

1. **Pre-commit Hooks (Husky + lint-staged)**
   - Runs automatically when you `git commit`
   - Only lints files you're committing (fast!)
   - Auto-fixes issues when possible
   - Blocks commit if unfixable errors exist

2. **ESLint (TypeScript/TSX)**
   - Catches syntax errors and type safety issues
   - Prevents unused variables
   - Detects unhandled promises
   - Enforces best practices

3. **Stylelint (CSS)**
   - Validates CSS syntax
   - Works with Tailwind CSS directives
   - Enforces consistent style

4. **Ruff (Python)**
   - Super fast Python linter (Rust-based)
   - Auto-formats code
   - Organizes imports
   - Enforces PEP 8 style

5. **Prettier (Code Formatting)**
   - Consistent code formatting
   - Auto-formats on save in VS Code

#### Configuration Files

| File                      | Purpose                             |
| ------------------------- | ----------------------------------- |
| `eslint.config.js`        | TypeScript/TSX linting rules        |
| `.stylelintrc.json`       | CSS linting rules, Tailwind support |
| `ruff.toml`               | Python linting rules                |
| `.lintstagedrc.json`      | Pre-commit configuration            |
| `.prettierrc.json`        | Code formatting rules               |
| `.husky/pre-commit`       | Git hook script                     |
| `.vscode/settings.json`   | VS Code auto-fix settings           |
| `.vscode/extensions.json` | Recommended extensions              |

### What This Prevents

#### TypeScript/TSX (ESLint)

✅ Syntax errors  
✅ Type safety issues  
✅ Unused variables and imports  
✅ Unhandled promises  
✅ Incorrect React hooks usage

#### CSS (Stylelint)

✅ Invalid CSS syntax  
✅ Duplicate selectors  
✅ Invalid at-rules

#### Python (Ruff)

✅ Syntax errors  
✅ Undefined variables  
✅ Unused imports  
✅ PEP 8 violations

#### General (Prettier)

✅ Inconsistent indentation  
✅ Mixed quotes  
✅ Trailing whitespace

### Troubleshooting

#### Pre-commit hooks not running?

```bash
pnpm prepare
chmod +x .husky/pre-commit
```

#### Linting errors blocking your commit?

```bash
# Try auto-fixing first
pnpm lint:fix
pnpm lint:py:fix

# Last resort: bypass (NOT RECOMMENDED)
git commit --no-verify
```

#### VS Code not showing lint errors?

1. Install all 4 recommended extensions
2. Reload VS Code: `Cmd+Shift+P` → "Developer: Reload Window"
3. Check `.vscode/settings.json` exists

#### Python linting not working?

```bash
pip install ruff
# Or
pnpm run setup:python
```

### Customizing Linting Rules

#### Disable Specific ESLint Rules

Edit `eslint.config.js`:

```javascript
rules: {
  '@typescript-eslint/no-explicit-any': 'off',  // Turn off
  '@typescript-eslint/no-unused-vars': 'warn',  // Warning only
}
```

#### Disable Specific Stylelint Rules

Edit `.stylelintrc.json`:

```json
{
  "rules": {
    "color-hex-length": null
  }
}
```

#### Disable Specific Ruff Checks

Edit `ruff.toml`:

```toml
[lint]
ignore = ["E501"]  # Line too long
```

### Tips for a Smooth Experience

1. **Install VS Code extensions first** - Catch errors as you type
2. **Run `pnpm lint:fix` before committing** - Auto-fix most issues
3. **Don't use `--no-verify`** - It bypasses safety checks
4. **Read error messages** - They tell you how to fix issues
5. **Ask for help** - If stuck on a linting error

### Additional Resources

- **ESLint**: https://eslint.org/
- **Stylelint**: https://stylelint.io/
- **Ruff**: https://docs.astral.sh/ruff/
- **Prettier**: https://prettier.io/

---
