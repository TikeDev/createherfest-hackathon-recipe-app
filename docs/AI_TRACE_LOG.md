# **\#75HER Challenge: AI Trace Log**

**Project Name:** \[Insert Project Name\] **Team Name:** \[Insert Team Name\]

---

## **💡 Purpose & Principles**

**Purpose:** Document how you utilized AI tools (goose, Claude, ChatGPT, etc.) to prove you **"augmented, not abdicated"** your responsibilities. This log demonstrates that while AI helped speed up your process, **you** owned the critical thinking, final choices, and implementation.

\+2

**Judges are looking for:**

* What you asked the AI to do.  
* What the AI suggested vs. what you actually kept or changed.  
* How you verified the accuracy of the AI's output.

---

## **🤖 AI Trace Entries**

Target: 3–6 entries minimum showing diverse usage (Code, Research, Documentation, etc.).

### **Trace \#1: \[Category, e.g., Code Generation\]**

* **Tool:** \[e.g., goose (Claude Sonnet 4.5)\]  
* **Prompt:** \[What you asked the AI to do\]  
* **AI Response:** \[Summary of what the AI suggested\]  
* **✅ What You Kept:** \[Which parts were useful and accurate\]  
* **✏️ What You Changed:** \[How you modified, improved, or secured the output\]  
* **🔍 Verification:** \[How you confirmed it worked, e.g., "Tested with 20 API calls"\]

---

### **Trace \#2: \[Category, e.g., Research & Content\]**

* **Tool:** \[e.g., Claude Opus 4.5\]  
* **Prompt:** \[What you asked\]  
* **AI Response:** \[Summary of response\]  
* **✅ What You Kept:** \[Information kept\]  
* **✏️ What You Changed:** \[e.g., "Removed unverified claims to match source language"\]  
* **🔍 Verification:** \[e.g., "Cross-checked against original sources in Evidence Log"\]

---

### **Trace \#3: \[Category, e.g., Accessibility Review\]**

* **Tool:** \[e.g., Claude Sonnet 4.5\]  
* **Prompt:** \[What you asked\]  
* **AI Response:** \[Summary of response\]  
* **✅ What You Kept:** \[Information kept\]  
* **✏️ What You Changed:** \[e.g., "Wrote custom alt-text rather than using AI-generated text"\]  
* **🔍 Verification:** \[e.g., "Ran WAVE extension; passed all checks"\]

---

## **Trace #1: Code Generation + Planning**

* Tool: Claude Sonnet 4.6 (via Claude Code)
* Prompt: "Let's start implementing the recipe extraction agent. We can go step by step @docs/PLAN-RECIPE_EXTRACTION_AGENT.md. Let me know if you have any questions or if something doesn't make sense or is contradictory"
* AI Response: Scaffolded the full Vite + React + TypeScript project with pnpm, created all shared types (`RecipeJSON`, `QueueEntry`, `ExtractionStatus`), built the IndexedDB storage layer (`db.ts`, `recipes.ts`, `queue.ts`), implemented 6 agent tools (`extractPreamble`, `parseIngredients`, `extractSteps`, `convertVolumeToWeight`, `convertWeightToVolume`, `validateOutput`) plus the ingredient density table, built the `recipeAgent.ts` orchestrator loop with OpenAI function calling, created the Vercel serverless CORS proxy (`api/fetch-recipe.ts`), implemented the `useRecipeExtraction` state machine hook, built all UI components (`RecipeInput`, `ExtractionProgressDisplay`, `IngredientList`, `StepList`, `OfflineBanner`), wired pages (`Home`, `Extract`, `RecipeDetail`), configured PWA, Vercel deployment, and Vite dev proxy for local URL testing.
* What You Kept: To fill in.
* What You Changed:
  * Corrected model from `gpt-4o` to `gpt-4o-mini` at temp `0.3`
  * Renamed the app to Simmer
  * Added `convert_weight_to_volume` as a 7th tool (Claude proposed 6) to support users without a kitchen scale
  * Promoted URL fetch and PlaybookView to MVP scope; demoted `map_annotations` and offline queue to stretch goals
  * Switched from npm to pnpm
  * Added a "Start Cooking" CTA button and `/cook/:id` route
  * Updated the dev proxy User-Agent to a full browser string
* Verification: To fill in.

---

## **🚦 Usage Rules & Ethics**

### **✅ The Green Zone (Allowed & Encouraged)**

* **Idea Exploration:** Brainstorming directions or generating "How-might-we" questions.  
* **Drafting Scaffolds:** Turning your own bullet points into code comments or copy.  
* **Self-Red-Teaming:** Asking AI to identify risks, edge cases, or counter-examples.

### **⚠️ The Yellow Zone (Requires Care)**

* **Facts & Stats:** Must be traceable to public sources and logged in your **Evidence Log**.  
* **Code Suggestions:** Must include license info and documentation of what you changed.

### **🚫 The Red Zone (Prohibited)**

* **Fabrications:** Do not use unverifiable claims.  
* **Hidden Automation:** Never claim AI-generated work as entirely your own.  
* **Privacy Violations:** Never upload private user data to AI tools.

---

## **✅ Submission Checklist**

* \[ \] At least 3–6 entries documented.  
* \[ \] Every entry shows a clear verification method (e.g., unit tests, cross-referencing).  
* \[ \] Clear distinction between AI output and your manual changes.  
* \[ \] Log is connected to the **Evidence Log** for any facts or code used.  
* \[ \] Demonstrates the "augment, not abdicate" principle.

---

*Part of the \#75HER Challenge | CreateHER Fest 2026*

