# **\#75HER Challenge: Risk Log**

**Project Name:** Simmer

**Team Name:** Spice Studio

---

## **💡 Purpose & Instructions**

**Purpose:** Track issues you identified and fixed during development. This demonstrates proactive problem-solving and critical thinking to judges.

**Instructions:** Document risks as you find them during the hackathon.

* Categorize each by severity (Critical, Major, or Minor).  
* Clearly show how you resolved them with evidence.  
* **Target:** Document at least **3 risks** you found and fixed.

---

## **🔴 Severity Levels**

* **Critical (Red):** Blocks submission. Includes exposed API keys, fabricated claims, IP violations, or a broken demo.  
* **Major (Orange):** Must fix before final submission. Includes missing citations, accessibility violations, or broken links.  
* **Minor (Yellow):** Document and fix if time permits. Includes minor typos or UI polish.

---

## **🛡️ Risk Log Table**

| Area | Issue Description | Severity | Fix Applied | Evidence/Link | Status |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Accessibility | Dark mode text invisible — `--color-cream` token remapped to dark background color, making body text unreadable in dark theme | 🔴 Critical | Changed text classes to use `dark:text-cream-text` (#FAF4EF) instead of `dark:text-cream` | Commit `938fa80` | ✅ Fixed |
| Accessibility | 24 a11y violations found via accessibility-agents audit — missing keyboard nav on grocery checklist, unlabeled star ratings, non-focusable progress dots, missing ARIA on radio groups | 🟠 Major | Added checkbox roles, labeled radio groups, roving tabindex, `aria-current` on nav, `aria-live` regions for announcements | Commit `00c6947` | ✅ Fixed |
| Code Quality | Floating promises in suggestion hooks — unhandled async calls triggered ESLint `@typescript-eslint/no-floating-promises` errors, blocking CI | 🟠 Major | Wrapped async calls with `void` operator and proper error handling | Commit `b5d90d1` | ✅ Fixed |
| Operational | CORS proxy unreliable — recipe URL extraction failing intermittently due to CORS rejections and agent loop not recovering gracefully | 🟠 Major | Hardened CORS proxy headers in `api/scrape_recipe.py`; added retry logic and better error messages in agent loop | Commit `2d208c6` | ✅ Fixed |
| Operational | CI pipeline failing — GitHub Actions couldn't resolve pnpm version, causing `pnpm install` to fail on every push | 🟠 Major | Added `packageManager` field to `package.json` and upgraded to pnpm v10 | Commit `e90bdab` | ✅ Fixed |
| AI Integration | gpt-5-nano temperature locked at 1 — discovered OpenAI removed temperature control for this model; higher randomness than ideal for structured extraction | 🟡 Minor | Accepted as model constraint; mitigated by strict system prompt and Zod validation on output | `src/agent/recipeAgent.ts` | ⚠️ Accepted |

---

## **🚩 Risk Categories to Monitor**

1. **Accuracy & Verifiability:** Are claims backed by credible sources?  
2. **Privacy & Security:** No exposed API keys or PII (Personally Identifiable Information).  
3. **Ethics & DEI:** Use of inclusive language and representative examples.  
4. **Legal/IP & Licensing:** Proper licenses for libraries and attribution for assets.  
5. **Accessibility:** Alt text on images and WCAG AA color contrast (4.5:1).  
6. **Operational:** The demo runs from a fresh clone and all links work.

---

## **✅ Self-Red-Team Checklist**

*Run this check 48 hours before submission\!*

### **Privacy & Security**

* \[x\] No API keys, passwords, or tokens in code.
* \[x\] .env.example file included with dummy values.
* \[x\] No real user data (emails/names) in screenshots or demos.

### **Accuracy & Sources**

* \[ \] All statistics have source citations in the Evidence Log.
* \[x\] Data visualizations show real or clearly labeled synthetic data.

### **Legal & IP**

* \[ \] LICENSE file present and all dependencies listed.
* \[x\] No unauthorized logos or trademarks used.

### **Accessibility**

* \[x\] All images have meaningful alt text.
* \[x\] Color contrast meets WCAG AA standards.
* \[x\] Keyboard navigation works for interactive elements.

### **Operational**

* \[ \] Project runs from a fresh clone.
* \[ \] All links in the README and documentation work.

---

## **🏆 Tips for a Strong Risk Log**

* **Be Honest:** Judges respect transparency regarding the issues you caught.  
* **Provide Evidence:** Document fixes with specific file names or line numbers.  
* **Update Regularly:** Check this list weekly during development (Days 51-70).  
* **Don't Claim Zero Risks:** It is not credible to have found no risks during a project.

---

Part of the \#75HER Challenge | CreateHER Fest 2026 

