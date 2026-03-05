# Team Setup Guide

## Table of Contents
- [📄 Updating Documentation](#-updating-documentation)
- [🎨 Claude Code Figma Plugin (MCP + Skills)](#-claude-code-figma-plugin-mcp--skills)
- [🔍 Chrome DevTools MCP](#-chrome-devtools-mcp)
  - [Option A: Chrome Beta (Mac/Windows)](#option-a-chrome-beta-macwindows)
  - [Option B: Brave on Windows (untested)](#option-b-brave-on-windows-untested)

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

