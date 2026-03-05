# Chrome DevTools MCP — Onboarding Guide

A portable reference for any Claude Code instance working in a project with Chrome DevTools MCP installed.
Drop this file into your repo and add the routing entry below to your `CLAUDE.md`.

## Table of Contents

- [How to Wire This Into CLAUDE.md](#how-to-wire-this-into-claudemd)
- [When to Use Chrome DevTools MCP](#when-to-use-chrome-devtools-mcp)
- [Standard Debugging Sequence](#standard-debugging-sequence)
- [Critical Anti-Patterns](#critical-anti-patterns)
- [Verifying Small Buttons and Toolbars](#verifying-small-buttons-and-toolbars)
- [Quick Reference](#quick-reference)

---

## When to Use Chrome DevTools MCP

**Reach for Chrome DevTools MCP when the user says things like:**
- "why isn't X rendering?" / "check if Y is visible"
- "look at the console errors" / "are there any network errors?"
- "is the element in the right position?" / "what does the DOM look like?"
- "debug this component" / "inspect the page"

**Also use it proactively after any frontend code change** — don't wait for the user to ask. Check for console errors and failed network requests as a matter of course.

**Core rule:**
> Chrome DevTools MCP = **observe** an already-open page.
> It reads DOM state, console output, and network traffic. It does not click, navigate, or drive user flows.

---

## Standard Debugging Sequence

Run this sequence after any frontend edit or when asked to debug:

```
1. list_pages                                          → discover what's open (ALWAYS start here)
2. select_page                                         → focus the right page
3. take_snapshot                                       → read DOM state (prefer over take_screenshot)
4. evaluate_script                                     → verify element position / render state
5. list_console_messages  (types: ["error"])           → catch runtime errors
6. list_network_requests  (resourceTypes: ["fetch","xhr"]) → find stuck or failed requests
```

Never skip step 1. Never assume a page is already selected.

---

## Critical Anti-Patterns

These are lessons learned from real debugging sessions — not hypotheticals.

### Anti-pattern 1: Trusting screenshots for UI correctness

Screenshots show *pixels*, not DOM truth. An element can look correct in a screenshot while being:
- Off-screen (negative `top` or `left`)
- Hidden behind another element (z-index issue)
- Attached to the wrong parent in the DOM

**Rule:** Always run `evaluate_script` with `getBoundingClientRect()` *before* declaring a UI element correct. Only take a screenshot after the coordinates are confirmed.

```js
() => {
  const el = document.querySelector('.your-selector');
  if (!el) return 'element not found';
  const rect = el.getBoundingClientRect();
  return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width, height: rect.height };
}
```

Cross-check the returned values against the parent container's rect to confirm relative position.

### Anti-pattern 2: Assuming a page is open

Never call `select_page` or `take_snapshot` without calling `list_pages` first.

The dev server may not be running. The tab may have been closed. The URL may have changed. Always discover before acting.

If `list_pages` returns nothing relevant → ask the user to confirm the dev server is running before proceeding.

### Anti-pattern 3: Defaulting to `take_screenshot` over `take_snapshot`

| Tool | Returns | Best for |
|------|---------|----------|
| `take_snapshot` | a11y tree with `uid` refs | DOM structure, form state, button labels, element count |
| `take_screenshot` | pixels | Visual layout confirmation only |

**Default to `take_snapshot`.** Use `take_screenshot` only as a follow-up when you need a pixel-level view after DOM state is already verified.

---

## Verifying Small Buttons and Toolbars

For icon-only buttons, screenshots are unreliable — icons look identical at 16px. Use `evaluate_script` to get a ground-truth ordered list of what's actually in the toolbar:

```js
() => {
  const toolbar = document.querySelector('.your-toolbar-selector');
  if (!toolbar) return 'toolbar not found';
  const buttons = [...toolbar.querySelectorAll('button')];
  return buttons.map(b => b.getAttribute('title') || b.getAttribute('aria-label') || b.textContent?.trim()).filter(Boolean);
}
```

This returns the buttons in DOM order with their accessible labels — don't guess from a screenshot.

---

## Quick Reference

| Signal in user message | First action |
|---|---|
| "debug", "inspect", "console errors", "why isn't rendering" | `list_pages` → `select_page` → `take_snapshot` |
| "screenshot" / visual layout check | `take_snapshot` first, then `take_screenshot` |
| "is X visible / in the right place" | `evaluate_script` + `getBoundingClientRect` |
| After any frontend code change | `list_console_messages (types: ["error"])` + `list_network_requests` |
| Toolbar or small button order | `evaluate_script` querying button titles/aria-labels |
