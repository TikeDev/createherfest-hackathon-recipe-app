# **\#75HER Challenge: Decision Log**

**Project Name:** Simmer

**Team Name:** Spice Studio

---

## **💡 Purpose & Instructions**

**Purpose:** Document your key technical choices and reasoning for judges. This helps them understand your engineering thinking.

**Instructions:**

* For each major decision, record the choice made, the "Why," and the "Tradeoff".  
* **Keep it punchy:** Each entry should be **1-2 lines maximum**.  
* **Focus on:** Architecture, tech stack, project scope changes, or selecting between multiple valid options.  
* **Target:** 5–10 key decisions minimum.

---

## **🛠 Decision Log**

| Category | Decision → Why | Tradeoff |
| :---- | :---- | :---- |
| **UX Design** | **"Simmer Coach" calm-voice branding** → Users with chronic or cognitive limitations are already managing stress; a warm, low-pressure coach tone reduces friction at the entry point and signals the app is built *for* them, not just *about* accessibility. | Softer brand voice may understate the AI complexity to judges; mitigated by the decision log and technical docs. |
| **Tech Stack** | **IndexedDB via idb** → All data stays in browser for offline-first PWA; no backend database needed | No cross-device sync; data lost if user clears browser storage |
| **Tech Stack** | **Vite 6** → Fast HMR, simple config, native ESM bundling for efficient project scaffolding | Less ecosystem than webpack; some plugins not yet compatible |
| **Tech Stack** | **React 19** → Latest features, easy for AI coding agents to generate and debug | Newer version has fewer community examples |
| **Tech Stack** | **TailwindCSS 3** → Utility-first CSS scales well with AI-generated components | Larger initial learning curve; verbose class names |
| **Tech Stack** | **Vercel for Deployment** → Free tier, automatic deploys on git push, serverless Python support | Vendor lock-in; cold starts on serverless functions |
| **Tech Stack** | **recipe-scrapers Python library** → Handles 400+ recipe sites with structured extraction | Requires serverless Python runtime; adds deployment complexity |
| **Architecture** | **Agentic tool loop for extraction** → Model orchestrates 7 tools (preamble, ingredients, steps, conversions, validation) for reliable structured output | More API calls than single-shot; 30 iteration limit may timeout on complex recipes |
| **Architecture** | **Two-stage suggestion: hard filter → soft rank** → Allergens/tools filtered client-side before LLM sees data; LLM only ranks safe recipes | LLM call adds latency; fallback to pure function if API fails |
| **Architecture** | **5-stage CookingMode playbook** → Groceries → Pre-Prep → Prep → Cook → Serve mirrors real cooking workflow for cognitive clarity | More UI complexity; requires careful stage transitions |
| **Architecture** | **Offline queue for failed extractions** → IndexedDB queue retries when network returns | Queue can grow if user stays offline; no notification of pending items |
| **AI Integration** | **gpt-5-nano for extraction agent** → Cheapest model sufficient for structured function calling | Temperature locked at 1; mitigated with strict prompts and Zod validation |
| **AI Integration** | **gpt-5-nano for suggestion agent** → Single structured-output call with temp=0.4 for consistent ranking | May hallucinate recipe IDs; fallback to pure function if validation fails |
| **Feature Scope** | **Cut voice input for MVP** → Focus on core extraction + cooking mode; voice adds complexity | Users must type or paste; revisit post-hackathon |
| **Feature Scope** | **Cut meal planning for MVP** → Single-recipe flow is simpler to demo and test | No weekly planning; users handle one recipe at a time |
| **Third-Party** | **Lucide React for icons** → Tree-shakeable, accessible, consistent 24×24 grid | Smaller icon set than FontAwesome; some icons missing |
| **Third-Party** | **shadcn/ui for components** → Copy-paste primitives with Radix accessibility baked in | Requires manual installation; no auto-updates |
| **Process** | **Pre-commit hooks (Husky + lint-staged)** → Catch TypeScript and lint errors before they hit CI | Slows down commits; developers may bypass with --no-verify |
| **Process** | **accessibility-agents on UI changes** → Automated a11y audit catches WCAG violations early | Adds tokens/cost per edit; some false positives require manual review |

---

## **📝 Guidance for Success**

### **✅ DO:**

* **Be Specific:** Use "React" instead of "frontend framework".  
* **Quantify:** Use "150KB bundle" instead of "large size".  
* **Focus on Engineering:** Avoid personal preferences; focus on technical requirements.  
* **Acknowledge Tradeoffs:** Every choice has a downside—be honest about what you accepted.

### **❌ DON'T:**

* **List Every Library:** Only include the "needle-movers".  
* **Justify Obvious Choices:** Don't explain why you used Git or a code editor.  
* **Write Essays:** Keep the judges' time in mind; stay concise.

---

## **✅ Submission Checklist**

* \[x\] At least 5 decisions documented.
* \[x\] Every decision has a clear, specific tradeoff.
* \[x\] Decisions reflect choices made **DURING** the hackathon.
* \[x\] Organized by category (Tech Stack, Architecture, etc.).
* \[x\] File saved as DECISION\_LOG.md in the /docs/ folder.

---

Part of the \#75HER Challenge | CreateHER Fest 2026