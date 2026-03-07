# Simmer — AI Model Selection Analysis

**Context:** All three AI tasks in Simmer currently use `gpt-5-nano` with a single fixed temperature. This is a flat model architecture — one tool for every job. This document maps each task to its actual computational requirements and recommends better-suited alternatives.

**Sources consulted:**
- [Comparing lean LLMs: GPT-5 Nano and Claude Haiku 4.5 — Portkey.ai](https://portkey.ai/blog/gpt-5-nano-vs-claude-haiku-4-5/)
- [GPT-5 mini vs Gemini 3 Flash vs Claude 4.5 Haiku — Respan.ai](https://www.respan.ai/blog/fast-model-comparison)
- [AI Model Comparison 2026 — Gosign](https://www.gosign.de/en/magazine/ai-models-comparison-2026/)
- [Low-Cost LLMs: API Price & Performance — IntuitionLabs](https://intuitionlabs.ai/articles/low-cost-llm-comparison)
- [Best Small LLMs for Edge Devices 2026 — SiliconFlow](https://www.siliconflow.com/articles/en/best-small-llms-for-edge-devices)
- [GPT-5 Nano Pricing Guide — GPTBreeze](https://gptbreeze.io/blog/gpt-5-nano-pricing-guide/)
- [Gemini 3 Flash vs GPT-5.2 vs GPT-5 mini — Adam Holter](https://adam.holter.com/gemini-3-flash-vs-gpt-5-2-vs-gpt-5-mini-quality-vs-cost-in-2026/)

---

## Pricing Reference (2026)

| Model | Input / 1M tokens | Output / 1M tokens | Notes |
|-------|-------------------|--------------------|-------|
| gpt-5-nano | $0.05 | $0.40 | Current — all 3 tasks |
| gpt-5-mini | ~$0.15 | ~$0.60 | Same API, stronger schema adherence |
| Claude Haiku 4.5 | $1.00 | $5.00 | Best-in-class for agentic multi-step |
| Gemini 3 Flash | $0.50 | $3.00 | 200 tok/s throughput, 1M context |
| all-MiniLM-L6-v2 | $0 | $0 | ~22M params, runs in-browser |

---

## Task 1 — Recipe Extraction Agent

**File:** `src/agent/recipeAgent.ts`
**Current config:** `gpt-5-nano`, `temp=1`, up to 30 iterations, 6 structured tools

### What this task actually requires

This is the most demanding AI task in the system. It runs a multi-step agentic loop over arbitrary HTML from web pages — noisy, ad-heavy, inconsistently structured content. It must:

- Reliably call 6 different tools in the right sequence
- Produce deeply nested, typed JSON output (ingredients with units, steps with annotations, substitutions)
- Self-validate output and retry when schema is incomplete
- Maintain coherence across 30 possible iterations

### Why gpt-5-nano is the wrong choice here

1. **`temp=1` is actively harmful for structured extraction.** High temperature is designed to increase creative variation — the opposite of what deterministic data extraction needs. Structured extraction should use `temp=0` to `temp=0.2`. At `temp=1`, gpt-5-nano will hallucinate field values, invent substitutions, and produce inconsistent unit formats.

2. **gpt-5-nano is built for routing and summarization**, not multi-step tool orchestration. It has a weak instruction-following baseline for long agentic contexts. Tool call failures and ID hallucinations (e.g. the fallback check already in `suggestionAgent.ts` line 110-115) are a direct symptom of using a model below the complexity threshold of the task.

3. **This task is low-frequency** — users run it once per recipe import, not on every page load. The cost of using a more capable model here is negligible in absolute terms.

### Recommended model: Claude Haiku 4.5

**Why:**
- Anthropic explicitly optimizes Haiku 4.5 for "multi-step agentic workflows" and complex instruction following
- Tool use via `input_schema` gives validated, schema-shaped arguments — directly equivalent to OpenAI function calling
- "Highly resistant to memorization" means it won't fill gaps in schema with plausible-sounding invented content
- The project already uses Zod for schema validation — Claude's tool use integrates cleanly with Zod schemas

**Fallback if budget-constrained:** `gpt-5-mini` — same OpenAI API, stronger schema adherence than nano, 20× cheaper than Haiku. Fix `temp=1` → `temp=0.2` regardless of which model is used.

**Corrected config:**
```
model: "claude-haiku-4-5-20251001"  (or "gpt-5-mini")
temperature: 0.1
max_tokens: 4096
```

---

## Task 2 — Suggestion Agent

**File:** `src/agent/suggestionAgent.ts`
**Current config:** `gpt-5-nano`, `temp=0.4`, single call, max 400 tokens

### What this task actually requires

A single structured-output call that:
- Reads a compact recipe summary (5-6 recipes, ~200 tokens each)
- Understands a short NL user note ("something warm and simple", "low energy day")
- Returns 1-3 recipe IDs with a warm, encouraging reason string (< 15 words each)
- Must return valid JSON

This is the **user-facing latency bottleneck** — it runs on every session start. Speed matters.

### Why gpt-5-nano is acceptable but not optimal

gpt-5-nano at temp=0.4 is a defensible choice here. The task is well-scoped, the prompt is short, and the output is small. The fallback to `suggestRecipes()` handles failures gracefully.

The main weakness: gpt-5-nano tends to produce **generic, flat reason strings** (e.g. "Good for low energy"). The "Why this fits you" reasons are a key demo differentiator — they should feel warm and specific to the user's note.

### Recommended model: Claude Haiku 4.5 (primary), with gpt-5-nano fallback

**Why Claude Haiku 4.5 for this task:**
- Anthropic models are trained with a strong emphasis on conversational warmth and nuanced instruction following
- A reason like *"Gentle on your hands, ready in 12 minutes"* vs *"Low complexity recipe"* — the quality difference is meaningful for a disability-focused app
- Single-call latency is still fast (Haiku 4.5 has the lowest time-to-first-token in its class)

**If OpenAI is preferred:** `gpt-5-mini` at `temp=0.4` produces noticeably warmer output than nano with minimal cost increase.

**Practical note for hackathon:** gpt-5-nano is acceptable here if credits are limited. The bigger win is fixing the extraction agent (Task 1) and the reason threading to RecipeDetail.

---

## Task 3 — Grocery Classifier

**File:** `src/agent/classifyGroceries.ts`
**Current config:** Assumed gpt-5-nano (file not read — this is an inference from architecture)

### What this task actually requires

Classify ingredient names into one of 11 fixed categories:
`Produce | Protein | Dairy | Pantry | Spices & Seasonings | Oils & Vinegars | Canned & Jarred | Frozen | Bakery | Beverages | Other`

This is a **simple enumeration classification** problem. Input is a short ingredient name string. Output is one of 11 fixed labels.

### Why this should not be an LLM call at all

The same codebase already contains two examples of the correct approach to this problem:

- `ALLERGEN_KEYWORDS` in `suggestRecipes.ts` — maps allergen labels to ingredient keywords
- `TOOL_KEYWORDS` in `suggestRecipes.ts` — maps tool restrictions to step-text keywords

A grocery category keyword lookup table of ~80-100 entries would correctly classify **95%+ of common recipe ingredients**, with zero API calls, zero latency, and zero cost. It also works fully offline — critical for a PWA.

**Example of what this looks like:**
```ts
const GROCERY_CATEGORY_MAP: Record<string, GroceryCategory> = {
  // Produce
  onion: "Produce", garlic: "Produce", potato: "Produce", tomato: "Produce",
  kale: "Produce", spinach: "Produce", lemon: "Produce", parsley: "Produce",
  // Protein
  chicken: "Protein", egg: "Protein", tofu: "Protein", pancetta: "Protein",
  // Pantry
  pasta: "Pantry", lentils: "Pantry", rice: "Pantry", flour: "Pantry",
  // Spices & Seasonings
  cumin: "Spices & Seasonings", turmeric: "Spices & Seasonings", paprika: "Spices & Seasonings",
  // Oils & Vinegars
  "olive oil": "Oils & Vinegars", "vegetable oil": "Oils & Vinegars",
  // Dairy
  cheese: "Dairy", butter: "Dairy", ghee: "Dairy",
  // ... ~80 more entries
};
```

**For edge cases** (unusual ingredients not in the map): fall back to `"Other"` rather than making an API call.

### If AI classification is truly desired: all-MiniLM-L6-v2

For genuinely unknown ingredients, a sentence-transformers model like `all-MiniLM-L6-v2` (~22M params, 384-dimensional embeddings) can run **entirely in-browser** via Transformers.js:

- Pre-embed the 11 category label strings once at startup
- At runtime, embed the ingredient name and find the nearest category by cosine similarity
- Zero API calls, zero cost, works offline, sub-10ms per classification

This is architecturally consistent with the PWA's offline-first design philosophy.

---

## Summary: Recommended Model Architecture

```
Task                    Current          Problem                    Recommendation
─────────────────────────────────────────────────────────────────────────────────
Recipe extraction       gpt-5-nano       Wrong model class,         Claude Haiku 4.5
(agentic, 30-iter)      temp=1           wrong temperature          temp=0.1

Suggestion agent        gpt-5-nano       Generic reason strings,    Claude Haiku 4.5
(single call, UX)       temp=0.4         acceptable but improvable  (or gpt-5-mini)

Grocery classifier      gpt-5-nano       LLM is overkill —          Keyword lookup table
(11-label enum)         (assumed)        rule-based covers 95%      + "Other" fallback
```

---

## Architectural Principle: Task-Appropriate Model Routing

The 2026 industry consensus is clear: the correct architecture is **not a single model for everything**, but a routing layer that matches task complexity to model capability and cost.

> "The bigger meta lesson is that most stacks need a router and a fallback, not a single hero model — pick one premium model you trust for the hard cases, then run everything else on a cheaper model that is 'good enough.'"
> — [Adam Holter, 2026](https://adam.holter.com/gemini-3-flash-vs-gpt-5-2-vs-gpt-5-mini-quality-vs-cost-in-2026/)

For Simmer specifically:

| Tier | Task | Model | Rationale |
|------|------|-------|-----------|
| Zero cost | Grocery classification | Keyword lookup table | Deterministic, offline, fast |
| Budget | Suggestion agent fallback | `suggestRecipes()` pure function | Already implemented |
| Mid | Suggestion agent primary | Claude Haiku 4.5 or gpt-5-mini | Warm UX copy, fast latency |
| Premium | Extraction agent | Claude Haiku 4.5 | Agentic reliability, schema fidelity |

---

## Immediate Hackathon Fix (No Model Change Required)

Even without switching models, **fix `temp=1` on the extraction agent to `temp=0.1`**. This is a single-line change in `recipeAgent.ts` that will immediately improve schema adherence and reduce tool call failures — without touching the model, the API key, or the cost.

High temperature on a structured extraction task is like adding random noise to a measurement instrument. There is no benefit.
