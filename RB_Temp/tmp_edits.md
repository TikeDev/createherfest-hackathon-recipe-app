What's solidly built
The core app is in much better shape than typical hackathon-day codebases. Routing, profile editor, the two-stage recommendation engine (hard filters + soft scoring), the 5-stage Playbook View with timers, the AI extraction agent, IndexedDB offline storage, and 5 well-crafted seed recipes are all there.

What would break or weaken the demo path
P0 — Breaks the 90-second demo:

"Why this fits you" is missing on RecipeDetail — The README demo script literally says step 3 is "open a recipe... see 'Why this fits you' context." RecipeDetail.tsx shows nothing. The match reasons[] come out of suggestRecipes() but are never passed to the detail page.

Seed recipe ingredients have no category field — The Groceries stage of CookingMode groups by grocery aisle (GroceryCategory). None of the 5 demo recipes have category set on their ingredients, so the aisle grouping will be flat/broken for every demo recipe.

P1 — Weakens the experience:

OpenAI key exposed client-side — VITE_OPENAI_API_KEY gets bundled into the JS. For a deployed demo, it's publicly readable. The scraper already runs server-side in Python; the extraction/suggestion agent calls should be proxied similarly.

Unknown intent clarify/skip flow — This is a named MVP acceptance criterion (#10) and needs to be confirmed working in Landing.tsx.

Profile-only fallback on /recipes — Direct nav to the recipe list without going through Landing should still surface profile-based suggestions.

P2 — Submission completeness:

README still has [Insert Team Name], [Insert Link] placeholders throughout — must be filled before submission.
Minor vercel.json / Python runtime config should be verified before deploy.
Ready to dig into any of these with you. What would you like to tackle first?

Claude’s Plan
Simmer — Demo Readiness Assessment
Context
Simmer is a React 19 PWA built for the CreateHerFest #75HER Hackathon (deadline: March 7, 2026). It helps people with physical/cognitive limitations find accessible recipes. The app uses IndexedDB for offline storage, gpt-5-nano for recipe extraction via function calling, and a two-stage hard-filter + soft-scoring recommendation engine.

The app is substantially built. The goal is not perfection but a smooth, reliable demo path in under 90 seconds.

Current State: What's Working
Full routing: Landing → Recipes/Home → RecipeDetail → CookingMode → Extract → Profile
Profile editor with all accessibility fields (allergens, tool restrictions, mobility/dexterity limits, preferred appliances, cognitive load)
Landing page with energy level selection + free-text note
Hard filter engine (allergens, excluded ingredients, tool restrictions, cognitive score cap)
Soft scoring (NL query relevance, time fit, appliance fit)
5-stage Playbook View (Groceries → Pre-Prep → Prep → Cook → Serve) with timers
Recipe extraction agent (6 tools, gpt-5-nano, function calling)
IndexedDB offline storage (recipes, profile, queue)
5 seeded demo recipes covering all 3 cognitive scores + variety of allergen test cases
PWA manifest + offline support
Tailwind theming + dark mode
Gaps for Demo Readiness
P0 — Breaks the Demo Path
"Why this fits you" missing on RecipeDetail

File: src/pages/RecipeDetail.tsx (fully reads but shows zero match reasons)
The README demo path step 3 explicitly says: "Step through the recipe with... 'Why this fits you' context"
suggestRecipes() returns reasons: string[] per suggestion — these need to be threaded through from the recipe card click into the detail view (via router state or re-computed)
Fix: Pass reasons via useLocation state from Home → RecipeDetail, render as a "Why this fits you" section above the CTA button
Ingredient categories missing from seed data

File: src/storage/seed.ts — no ingredient has a category field set
The Groceries stage of CookingMode groups by GroceryCategory; without categories all 5 demo recipes will show a flat uncategorized list, breaking the grocery aisle grouping that's a key demo feature
Fix: Add category field to all seed recipe ingredients (Produce, Protein, Pantry, Spices, etc.)
P1 — Weakens Demo Experience
API key exposed client-side

VITE_OPENAI_API_KEY is bundled into the JS bundle — anyone can inspect it from a deployed demo
The extraction agent and suggestion agent call OpenAI directly from the browser
Fix for demo: Route AI calls through a Vercel serverless function (similar to scrape-recipe.py) so the key stays server-side. Or at minimum, document key rotation plan + set usage limits on the key.
Unknown intent clarify/skip flow

MVP acceptance criteria #10: "Unknown text triggers exact inline clarification message"
Not confirmed implemented in Landing.tsx — needs verification
If missing: Add inline message + Clarify/Skip buttons in Landing when free-text intent is ambiguous
Profile-only fallback on Home (no session)

When navigating directly to /recipes (skipping Landing), users with a profile should get profile-based recommendations, not just an empty state
Needs verification that suggestRecipes() is called with profile alone when no session state exists
Recipe cards don't visibly show match reasons in list

RecipeCard.tsx receives reasons from suggestion engine but need to verify they render visibly in the UI (not just as tooltip/hidden)
P2 — Polish / Submission Completeness
README placeholders unfilled

Team name, GitHub/LinkedIn links, Demo Video link, Live Demo link all say [Insert X]
Must be filled before submission
vercel.json discrepancy

README mentions api/fetch-recipe.ts but actual file is api/scrape-recipe.py
Verify Vercel routes Python function correctly (runtime config, requirements.txt)
Empty state when no recipes match filters

If hard filters block all 5 demo recipes, what does the user see? Needs a graceful empty state with guidance
Cognitive complexity not shown on recipe cards/detail

Demo reviewers benefit from seeing that the app actually filtered by complexity
Add a subtle complexity badge (Low / Medium / High) to recipe cards
Demo-Critical Files
File	Role	Status
src/pages/RecipeDetail.tsx	Missing match reasons	Needs "Why this fits you" section
src/storage/seed.ts	Missing ingredient categories	Add category to all ingredients
src/pages/Landing.tsx	Unknown intent flow	Verify / implement clarify-skip
src/pages/Home.tsx	Profile-only fallback	Verify works without session
src/components/recipes/RecipeCard.tsx	Match reasons render	Verify visible
api/scrape-recipe.py	Serverside scraper	Verify Vercel routing
README.md	Submission placeholders	Fill in team/links
Recommended Demo Path (After Fixes)
Open app → Land on energy selector
Select "Low energy" + type "something warm and simple"
See 3 ranked suggestions with "Why this fits you" reasons
Click a recipe → See match reasons + ingredients → "Let's cook"
Walk through Playbook View: grocery checklist → prep → cook (timer demo) → serve
Show profile page to demonstrate safety constraints
Extract a new recipe via URL or paste
Verification
Run pnpm dev and walk the 90-second demo path start-to-finish
Set an allergen in profile → verify allergen recipes disappear from suggestions
Click a suggested recipe → verify "Why this fits you" section appears on RecipeDetail
Open CookingMode → Groceries stage → verify items are grouped by aisle category
Deploy to Vercel (pnpm build) → verify scraper API responds to a test URL
