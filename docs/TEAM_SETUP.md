# Team Setup Guide

## Table of Contents
- [📄 Updating Documentation](#-updating-documentation)
- [🎨 Claude Code Figma Plugin (MCP + Skills)](#-claude-code-figma-plugin-mcp--skills)
- [🔍 Chrome DevTools MCP](#-chrome-devtools-mcp)

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

Gives Claude Code the ability to inspect and interact with a Chrome browser — useful for debugging the PWA, checking network requests, and testing accessibility.

**Prerequisites:** Node.js v20.19+, Chrome Beta (preferred) or Chrome stable

> **How this project works:** Instead of letting the MCP launch its own Chrome, we connect it to an existing Chrome Beta instance running with remote debugging on port 9222. The `pnpm dev:browser` script handles this automatically.

### Project-level setup (use this)

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

### Install the MCP (if not already installed)

**User-level (global, recommended):**
```bash
claude mcp add chrome-devtools --scope user npx chrome-devtools-mcp@latest --browser-url=http://127.0.0.1:9222
```

**Project-level only:**
```bash
claude mcp add chrome-devtools --scope project npx chrome-devtools-mcp@latest --browser-url=http://127.0.0.1:9222
```

> **Note:** The `--browser-url` flag is required for this project. Without it, the MCP tries to launch its own Chrome instead of connecting to the one started by `pnpm dev:browser`.

### Verify the install

With `pnpm dev:browser` running, ask Claude: `"Do you see the running app?"` — Claude should respond with the page at `localhost:5173`.

