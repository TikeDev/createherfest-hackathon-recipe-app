# 🔍 Perplexity Enterprise Guide

A practical guide for the Recipe Streamliner team on how to use Perplexity Enterprise effectively during the hackathon.

## Table of Contents

- [What Is Perplexity Enterprise?](#what-is-perplexity-enterprise)
- [How It Differs From Claude Code / Goose](#how-it-differs-from-claude-code--goose)
- [Use Cases For This Project](#use-cases-for-this-project)
  - [🧠 Research & Domain Knowledge](#-research--domain-knowledge)
  - [📦 Up-to-Date Library Docs & Debugging](#-up-to-date-library-docs--debugging)
  - [🏆 Competitive & Accessibility Research](#-competitive--accessibility-research)
  - [✍️ Content & Copy](#️-content--copy)
- [Suggested Team Workflow](#suggested-team-workflow)
- [Example Queries](#example-queries)
- [Tips & Gotchas](#tips--gotchas)

---

## What Is Perplexity Enterprise?

Perplexity Enterprise is an AI-powered search and research tool that answers questions by actively searching the web and citing its sources. Unlike general-purpose LLMs, it:

- 🌐 Retrieves **live, current information** (not capped by a training cutoff)
- 📎 Cites sources so you can verify and dig deeper
- 🔬 Is optimized for **research and synthesis**, not code generation
- 🔒 Enterprise tier means your queries are **not used for training** and data stays private

---

## How It Differs From Claude Code / Goose

| | Perplexity Enterprise | Claude Code | Goose |
|---|---|---|---|
| **Best for** | Research, finding current docs, competitive analysis | Writing/editing code, file changes, implementation | Autonomous multi-step dev tasks |
| **Web access** | ✅ Live search | Limited | Varies by plugin |
| **Cites sources** | ✅ Yes | ❌ No | ❌ No |
| **Writes code** | Basic snippets only | ✅ Production-grade | ✅ Yes |
| **Knows your codebase** | ❌ No | ✅ Yes | ✅ Yes |
| **Training cutoff** | N/A (live search) | Aug 2025 | Varies |

> 💡 **Rule of thumb:** Use Perplexity to *learn what to build*, then hand off to Claude Code or Goose to *build it*.

---

## Use Cases For This Project

### 🧠 Research & Domain Knowledge

This is Perplexity's strongest value for Recipe Streamliner. Use it to inform design and product decisions.

**♿ Accessibility & user research**
- What physical and cognitive limitations most affect people's ability to cook?
- Which kitchen tools are hardest to use with limited dexterity or grip strength?
- What does WCAG say about step-by-step task UIs?
- What are best practices for low-cognitive-load app design?

**🥄 Ingredient & nutrition data**
- Find public datasets or APIs for ingredient densities (to extend `src/lib/densityTable.ts`)
- Search for substitution databases (e.g., allergen-safe swaps) that could enrich recipe data
- Look up conversion edge cases (e.g., how density varies for sifted vs. packed flour)

**📋 Recipe sourcing**
- Find websites with accessible, beginner-friendly recipes to use as test data
- Identify sites with permissive licensing for recipe content

---

### 📦 Up-to-Date Library Docs & Debugging

Claude Code's knowledge cuts off at August 2025. For anything released or changed after that, Perplexity is more reliable.

**Good queries:**
- "vite-plugin-pwa 1.x workbox configuration for IndexedDB offline caching"
- "OpenAI function calling parallel tool use best practices 2025"
- "idb v8 TypeScript createStore example"
- "Vercel serverless function timeout limits free tier 2026"

After getting an answer, paste the relevant snippet into your conversation with Claude Code to apply it to your actual files.

---

### 🏆 Competitive & Accessibility Research

Useful for the pitch and for validating your feature set.

- "Accessible recipe apps for people with disabilities — what exists?"
- "Cognitive load considerations for cooking apps"
- "Voice-guided cooking apps — what features do users find most helpful?"
- "What accessibility features do popular recipe apps (NYT Cooking, AllRecipes) lack?"

---

### ✍️ Content & Copy

Perplexity can help you write user-facing language that's grounded in real accessibility guidance.

- "How should apps communicate allergen warnings to users with cognitive disabilities?"
- "Plain language guidelines for step-by-step instructions"
- "Examples of inclusive onboarding copy for accessibility-focused apps"

---

## 🔄 Suggested Team Workflow

```
1. 🤔 Identify a question or gap
         ↓
2. 🔍 Research in Perplexity (get sources, summaries)
         ↓
3. 📋 Paste findings into Claude Code / Goose chat
         ↓
4. 🛠️ Implement in codebase
```

**Example:**
1. *Question:* What ingredient densities are we missing in our density table?
2. *Perplexity:* Search "common baking ingredient densities g/ml list" → get a sourced table
3. *Claude Code:* "Here's the density data I found — add missing entries to `src/lib/densityTable.ts`"
4. ✅ Done.

---

## 📋 Example Queries

Copy-paste these directly into Perplexity:

```
What are the most common physical and cognitive limitations that make cooking difficult?

List kitchen tools ranked by difficulty of use for people with limited hand strength or dexterity.

What ingredient substitution databases or APIs are publicly available?

What are WCAG 2.2 guidelines relevant to step-by-step task completion UIs?

What does current research say about cognitive load in mobile cooking apps?

vite-plugin-pwa offline caching for dynamic IndexedDB content — current best practices

OpenAI gpt-4o-mini function calling — parallel tool use limitations

What recipe websites have the most accessible, plain-language content?
```

---

## ⚠️ Tips & Gotchas

- ✅ **Always check the sources.** Perplexity synthesizes well but occasionally misreads or outdated pages slip in. Click through on anything you plan to implement.
- 🚫 **It's not a code editor.** Code snippets from Perplexity often need adaptation. Bring them to Claude Code for integration.
- 💬 **Use follow-up questions.** Perplexity's multi-turn search is strong. Start broad, then narrow: "Tell me more about option 2" or "Find a specific example of this pattern."
- 🔖 **Save useful threads.** Perplexity Enterprise lets you save searches. Bookmark research threads the whole team might reference.
- 🏗️ **Don't use it for implementation decisions alone.** Perplexity doesn't know your codebase. Always validate findings against your actual architecture in Claude Code.
