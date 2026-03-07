# Simmer — Score-Maximizing Plan (Judging Criteria Mapped)

**Scoring breakdown:** Communication (Clarity 25% + Usability 20% + Polish 10%) = **55%** | Technical (Proof 25% + Rigor 20%) = **45%**

The app's technical foundation is strong. The highest ROI moves are fixing the two P0 demo blockers and then writing smart documentation.

---

## Priority 1 — Proof (25%) · Highest risk, highest weight

**What judges check:** Demo runs from clean start, Evidence Log linked, sources cited.

Two P0 issues will visibly break the demo mid-flow without fixes:

| Fix | File | Effort | Impact |
|-----|------|--------|--------|
| Add "Why this fits you" section | `src/pages/RecipeDetail.tsx` | ~30 min code | Demo step 3 broken without this |
| Add `category` to all seed ingredients | `src/storage/seed.ts` | ~20 min data | Grocery aisle grouping broken without this |
| Create `EVIDENCE_LOG.md` with 3 cited sources | new file | ~15 min writing | Required by rubric — easy win |

**Evidence Log minimum — 3 citations suggested:**
1. A peer-reviewed or government source on disability + cooking barriers
2. A source on cognitive accessibility in UX (e.g., WebAIM or W3C WCAG)
3. A source on food insecurity/accessibility overlap

No cloud setup needed. All local fixes.

---

## Priority 2 — Clarity (25%) · Pure writing, no code

**What judges check:** Problem statement crisp, demo is reproducible, 4-Line Problem Frame in README.

**Action:** Add this block to the top of `README.md`:

```
Who:     People with physical, cognitive, or temporary limitations who struggle to cook safely
Problem: Mainstream recipe apps ignore safety constraints, cognitive load, and tool restrictions
Fix:     Simmer recommends recipes filtered to your exact limitations with an accessible step-by-step cooking mode
Test:    Set one allergen in Profile → that recipe disappears from suggestions in under 10 seconds
```

Also: verify the demo runs from an incognito/clean browser with no cached state.

---

## Priority 3 — Rigor (20%) · High ROI writing

**What judges check:** Ethical considerations, SDG alignment, documented tradeoffs, at least one risk addressed.

This app has rich material here — it just needs to be written down.

**Actions (all writing, no cloud):**

1. **Add an Ethics & Risks section to README** covering:
   - **Bias risk:** Recipe dataset is small (5 seeds) — recs are profile-constrained not nutritionally validated; explicitly disclaim medical/clinical use
   - **Privacy:** All data stays in the user's browser (IndexedDB, no server-side profile storage) — call this out as a deliberate privacy-by-design choice
   - **API key exposure:** Document that `VITE_OPENAI_API_KEY` is client-side for demo purposes, note key rotation plan and usage limits as mitigation
   - **One thing tried that didn't work:** e.g. "We initially tried calling the extraction agent server-side via a Vercel function but hit cold-start latency issues on the free tier, so we moved AI calls client-side for demo reliability"

2. **Add SDG alignment:**
   - SDG 3 (Good Health & Well-Being)
   - SDG 10 (Reduced Inequalities)

3. **Document key tradeoffs:**
   - gpt-5-nano (fast/cheap vs. gpt-4o)
   - Client-side IndexedDB vs. server DB (privacy trade-off)
   - Curated seed data vs. live scraping (reliability trade-off)

---

## Priority 4 — Usability (20%) · Writing + minor check

**What judges check:** 3-Line Pitch clear, alt text/captions present, grade-8 readability.

**Actions:**
1. The 4-Line Problem Frame above (Priority 2) doubles as the 3-Line Pitch for Devpost
2. The app already has `aria-label` attributes — confirm a few key interactive elements
3. Keep README sentences short, avoid jargon — aim for grade-8 readability (Hemingway Editor is a free browser tool)

---

## Priority 5 — Polish (10%) · Cleanup

**What judges check:** No broken links, tidy repo, `.env.example` present, no hardcoded secrets.

**Status:**
- `.env.example` exists
- `Windows/SETUP.md` anonymized (needs commit + push — already done locally)
- README team placeholders still show `[Role]`, `[@username]`, `[Profile Link]` — must be filled
- Search repo for any `TODO` or `FIX` comments and clean up or label as "Known Issues"

---

## Execution Order (minimal cloud/credits needed)

```
1. Fix seed.ts categories                    ~20 min  pure data, no cloud
2. Fix RecipeDetail "Why this fits you"      ~30 min  local code
3. Create EVIDENCE_LOG.md                    ~15 min  writing
4. Add Problem Frame + Ethics to README      ~20 min  writing
5. Fill README team/link placeholders        ~ 5 min
6. Commit + push Windows/SETUP.md           ~ 5 min  already done locally
7. Record demo video (clean/incognito)       ~20 min
```

**Total estimated effort: ~2 hours**

---

## What to Skip or Defer

- **Routing AI calls through Vercel serverless (P1 API key issue):** Set a strict spending cap on the OpenAI key and document it as a known limitation. This avoids cold-start risk on demo day and requires no new infra.
- **Complexity badge on recipe cards:** Nice-to-have — not worth the risk of introducing a UI bug day-of.
- **Vercel scraper verification:** Only needed if you demo the URL import path. Skip that step in the 90-second demo to reduce surface area for failure.

---

## Key Rubric Quotes to Keep in Mind

> "Communication (Clarity + Usability + Polish) = 55%. Technical depth (Proof + Rigor) = 45%. Both matter."

> "Rigor: Document 1 thing you tried that didn't work and why"

> "Proof: Create Evidence Log table with 3 cited sources"

> "Polish: Add a .env.example file and remove any hardcoded secrets"
