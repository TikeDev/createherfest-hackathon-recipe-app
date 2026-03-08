# Simmer 🍲

**🔗 [Try the Live Demo!](https://createherfest-hackathon-recipe-app.vercel.app/)** (mobile friendly)

**A React PWA that helps people with physical, cognitive, or temporary limitations find and follow accessible recipes.**

---

## 🧩 Problem Frame

| **User** | Individuals with executive functioning challenges who love to cook but want recipes that adapt to their brain's contradictory need for novelty while also providing a structure that simplifies cooking

| **Problem** | Choosing recipes according to their changing level of energy/focus and following recipes with complex asynchronous steps

| **Constraints** | Time and budget

| **Success Test** | Pick a recipe according to energy level and successfully go through all recipe's steps sequentially with the ability to navigate back and forth between steps, with the current step in view while all others are hidden

---

## ✨ Key Features

- **Soft scoring & explainability:** Remaining recipes are ranked by time fit, energy fit, appliance fit, sensory match, and cleanup burden. Every recommendation shows "Why this fits you."
- **AI extraction agent:** Imports any recipe URL or pasted text into a structured, offline-capable format using gpt-5-nano with function calling.
- **Playbook View:** Step-checkable cooking mode with large text and minimal distraction — designed for use while cooking with limited attention.
- **Source-faithful substitutions:** Ingredient alternatives are shown only when the original recipe source provides them, and only after passing all safety constraints.

---

## 🚀 Quick Start & Demo Path

**[Live Deployment](https://createherfest-hackathon-recipe-app.vercel.app/)** (mobile friendly)

### Installation (1 Command)

**Requirements:** Node 18+, pnpm, OpenAI API key.

```bash
git clone https://github.com/TikeDev/createherfest-hackathon-simmer simmer && cd simmer && cp .env.example .env && pnpm install && pnpm dev
```

Add your `VITE_OPENAI_API_KEY` to `.env`, then open **http://localhost:5173** in your browser.

### 60-Second Demo Path

1. **Set up your profile** — Select allergens, mobility limits, and preferred appliances → Profile is saved locally.
2. **Describe today's state** — Pick chips ("low energy", "one hand") and/or type a note → App filters and scores in real time.
3. **Open a recipe in Playbook View** — Tap a recommendation → Step through the recipe with checkboxes, large text, and "Why this fits you" context.
4. **Import a recipe** — Paste a URL or recipe text → Extraction agent parses it into structured format, available offline.

**📹 Demo Video:** [Insert Link] | **🔗 Live Demo:** [createherfest-hackathon-recipe-app.vercel.app](https://createherfest-hackathon-recipe-app.vercel.app/)

---

## 🏗️ Technical Architecture

**Components:**

- **Frontend:** React 19 + TypeScript — PWA (via `vite-plugin-pwa`), Vite 6, Tailwind CSS 3. Handles profile setup, session input, recommendations, recipe detail, and Playbook View.
- **Backend:** Vercel serverless function (`api/fetch-recipe.ts`) — CORS proxy for recipe URL fetching. No persistent server.
- **Database:** IndexedDB via `idb` — fully local storage for recipes, user profile, and offline extraction queue.
- **AI Integration:** OpenAI `gpt-5-nano` (temp 0.3) with function calling — powers the recipe extraction agent (parse ingredients, extract steps, convert units, validate output).

### 🤖 goose Integration (AI/ML Track)

- **Model:** gpt-5-nano via OpenAI SDK (run directly in-browser through a Vercel-proxied API call).
- **Implementation:** A multi-step agent loop in `src/agent/recipeAgent.ts` calls 6 structured tools — `extract_preamble`, `parse_ingredients`, `extract_steps`, `convert_volume_to_weight`, `convert_weight_to_volume`, `validate_output` — to transform unstructured recipe text into typed, validated JSON. The agent runs up to 10 iterations with a tool-call cap.
- **Impact:** Converts any recipe URL or raw text into an accessible, structured format in ~5–10 seconds — including both volume and weight unit variants for users who cook by feel or by scale.

---

## 📋 Project Logs & Documentation

| Log Type                  | Purpose                                                     | Link to Documentation                                                                    |
| :------------------------ | :---------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| **Decision Log**          | Technical choices & tradeoffs                               | [docs/DECISION_LOG.md](docs/DECISION_LOG.md)                                             |
| **Risk Log**              | Issues identified & fixed                                   | [docs/RISK_LOG.md](docs/RISK_LOG.md)                                                     |
| **Evidence Log**          | Sources, assets & attributions                              | [docs/EVIDENCE_LOG.md](docs/EVIDENCE_LOG.md)                                             |
| **MVP Spec**              | Full feature spec, data types, APIs, 16 acceptance criteria | [docs/plans/Initial_MVP_Plan.md](docs/plans/Initial_MVP_Plan.md)                         |
| **Extraction Agent Plan** | Agent pipeline, tools, output format, offline queue         | [docs/plans/PLAN-RECIPE_EXTRACTION_AGENT.md](docs/plans/PLAN-RECIPE_EXTRACTION_AGENT.md) |
| **Architecture Diagrams** | Mermaid flow diagrams for the full system                   | [docs/plans/Plan_Overview_Diagram.md](docs/plans/Plan_Overview_Diagram.md)               |

---

## 🧪 Testing & Known Issues

**Test Results:** Manual testing — unit tests not yet written.

- **Known Issue:** Extraction agent reliability varies with heavily formatted recipe pages (infinite scroll sites, paywalled content). Workaround: paste recipe text directly.
- **Known Issue:** Offline queue drain (processing URL imports when connectivity returns) is not yet implemented — queued URLs remain pending until the user re-opens the app online.
- **Next Step:** Add PlaybookView, recommendation engine with hard filter + soft scoring, and the curated recipe dataset.

---

## 👥 Team & Acknowledgments

**Team Name:** Spice Studio

| Name              | Role                                  | GitHub           | LinkedIn                                          |
| :---------------- | :------------------------------------ | :--------------- | :------------------------------------------------ |
| Kerline Moncy     | Lead Developer and DevOps Engineer    | @TikeDev         | https://www.linkedin.com/in/kerline-moncy/        |
| Paula Bass Werner | Technical Product Manager             | @pbasswerner     | https://www.linkedin.com/in/paula-bass-werner/    |
| Rahul Basu        | System Architecture and AI Consultant | @EruditeStranger | https://www.linkedin.com/in/rahul-basu-238a18100/ |

**Special thanks to:** CreateHER Fest and the #75HER Challenge organizers.

---

## 📄 License & Attributions

**Project License:** MIT

- **React 19** — MIT License | https://react.dev
- **Vite 6** — MIT License | https://vitejs.dev
- **Tailwind CSS 3** — MIT License | https://tailwindcss.com
- **idb** — ISC License | https://github.com/jakearchibald/idb
- **OpenAI Node SDK** — Apache 2.0 | https://github.com/openai/openai-node
- **vite-plugin-pwa** — MIT License | https://github.com/vite-pwa/vite-plugin-pwa
- **Zod** — MIT License | https://github.com/colinhacks/zod
- **@mozilla/readability** — Apache 2.0 | https://github.com/mozilla/readability

---

Built with ❤️ for #75HER Challenge | CreateHER Fest 2026
