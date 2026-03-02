# Hackathon Project: Recipe Streamliner
**Deadline:** March 7th (Night of Submission)

## Project Overview
A responsive web/PWA recipe app that supports people with temporary, chronic, or permanent limitations by combining:
- Long-term user profile constraints and preferences.
- Persistent disability support settings (temporary, chronic, or permanent) saved to profile.
- Optional in-the-moment input (state chips, text, or both).
- Explainable recipe recommendations with hard safety filtering.
- A simplified "Playbook View" for recipe readability.

---

## MVP Goals (2 Weeks)

### 1. Profile-Driven Recipe Recommendations (Primary Demo Flow)
- User creates and saves a persistent profile.
- Recommendation engine uses profile rules as the baseline.
- If the user provides no temporary input, the app falls back to profile-only recommendations.
- Profile must support disability-aware cooking needs, including dexterity and physical limitations.

### 2. Flexible Temporary State Input
- User can provide:
  - State chips only, or
  - Free text only, or
  - Chips + free text.
- This supports scenarios like low energy, low mood, pain flare, brain fog, or specific requests in text.

### 3. Unknown Text Intent Handling
- If free text cannot be interpreted with enough confidence, show:
  - **"I'm not sure what the intent of that text is. Please clarify or skip."**
- Provide two actions:
  - `Clarify` (default highlighted action)
  - `Skip this text and continue`
- If user skips unknown text:
  - Continue with chips if present.
  - Otherwise continue with profile-only fallback.

### 4. Hard Safety Constraints (Always Enforced)
The app must never recommend recipes that violate:
- Allergens
- Explicitly excluded ingredients
- Restricted techniques/tools
- Strict cognitive complexity limits (when enabled in profile)

### 5. Playbook View + Optional URL Import
- Keep "Playbook View" transformation for simplified instructions.
- URL import/adaptation remains secondary for MVP reliability.
- Curated tagged dataset is the primary recipe source.

### 6. Ingredient Alternatives (When Provided by Source)
- If the original recipe explicitly mentions ingredient alternatives/substitutions, preserve and surface them.
- Only show alternatives that pass user safety constraints (allergens, excluded ingredients, diet/tool limits where relevant).
- In recipe detail/playbook view, clearly label substitutions as optional alternatives, not required changes.

---

## Product Scope

### In Scope
- Profile onboarding and editing.
- Recipe recommendations from curated metadata.
- Explainable ranking reasons ("Why this fits you").
- Temporary state input: chip/text/both.
- Profile-only fallback if temporary input is empty.
- Unknown intent clarify/skip flow.
- Disability-aware matching (example: no-knife options, pre-cut/frozen/canned ingredient options, low-maintenance appliances).
- Recipe detail and readable playbook formatting.
- Source-provided ingredient alternatives with safety-aware filtering.
- Accessibility baseline (keyboard nav, contrast, scalable text, screen-reader labels).

### Out of Scope
- Full live recipe scraping/discovery engine.
- Clinical diagnostics/medical advice.
- Advanced social ecosystem.
- Complex ML training pipeline.

---

## Core Data and Interfaces

### `UserProfile`
- `allergens: string[]`
- `excludedIngredients: string[]`
- `dietPattern: string[]`
- `limitationDuration: "temporary" | "chronic" | "permanent" | "mixed"`
- `mobilityLimits: string[]`
- `dexterityLimits: string[]`
- `toolRestrictions: string[]`
- `prepAssistPreferences: string[]` // ex: pre-cut, frozen, canned
- `preferredAppliances: string[]` // ex: slow cooker, air fryer, Instant Pot
- `sensoryPreferences: { avoidTextures: string[]; spiceLevelMax?: number }`
- `cognitiveLoad: "low" | "medium" | "high"`
- `timePreferenceMinutes?: number`
- `budgetLevel?: "low" | "medium" | "high"`
- `audioReadoutEnabled?: boolean`
- `audioPrefs?: { defaultVoice?: string; speechRate?: number; chunkSize?: "short" | "medium"; autoAdvance?: boolean; confirmBeforeNext?: boolean }`

### `SessionState`
- `chips?: SessionChip[]`
- `note?: string`

Validation:
- Chips only: valid
- Text only: valid
- Chips + text: valid
- Neither provided: valid, but engine runs `profile_only` mode

### `RecipeMetadata`
- `allergens: string[]`
- `ingredients: string[]`
- `ingredientAlternatives?: { ingredient: string; alternatives: string[]; sourceNote?: string }[]`
- `techniques: string[]`
- `tools: string[]`
- `knifeRequired: boolean`
- `ingredientConvenienceTags: string[]` // ex: pre-cut, frozen, canned
- `applianceTags: string[]` // ex: slow cooker, air fryer, Instant Pot
- `totalMinutes: number`
- `stepCount: number`
- `complexity: "low" | "medium" | "high"`
- `sensoryTags: string[]`
- `comfortTags: string[]`
- `cleanupLoad: "low" | "medium" | "high"`

### APIs
- `POST /api/recommendations`
  - Request: `{ profileId, sessionState?, limit }`
  - Response: `{ items: [{ recipeId, score, reasons[] }], filteredOutCounts, mode }`
- `GET /api/profile/:id`
- `PUT /api/profile/:id`
- `POST /api/grocery-list` (stretch)
  - Request: `{ recipeIds: string[], profileId?: string }`
  - Response: `{ sections: [{ section: string, items: string[] }] }`

---

## Recommendation Logic

### Hard Filter Phase
Remove recipes that conflict with any hard constraint.
- If profile indicates strict dexterity/physical restrictions, block recipes requiring restricted prep tasks (for example, heavy knife work).
- For suggested ingredient alternatives, filter out any substitute that violates hard constraints.

### Soft Scoring Phase
Rank remaining recipes by:
- Time fit
- Energy fit
- Mood/comfort fit
- Sensory fit
- Cleanup burden
- Cost fit
- Prep accessibility fit (pre-cut/frozen/canned compatibility)
- Appliance fit (slow cooker/air fryer/Instant Pot preferences)

### Ranking Modes
- `profile_plus_state`: chips/text are available and interpretable.
- `profile_only`: no temporary input (or skipped unknown text with no chips).

---

## Technical Implementation Notes
- Use curated recipe dataset (50-150 recipes) with explicit tags.
- Keep optional import/adaptation path decoupled from recommendation core.
- Maintain source fidelity checks for playbook transformations.
- Preserve source intent: alternatives are only shown when present in source or trusted dataset metadata.
- Build an evaluation suite for recipe conversion quality and recommendation safety.

---

## Two-Week Build Plan

### Week 1
1. Finalize schema/types and request validation.
2. Build profile setup/edit flow.
3. Build recommendation input UI (chips + optional text).
4. Prepare curated dataset and metadata tagging.
5. Implement hard filters + baseline scoring.
6. Ship recommendation list with explainability reasons.

### Week 2
1. Add text intent parsing + unknown-intent clarify/skip flow.
2. Build recipe detail + playbook rendering.
3. Add optional URL import/adaptation path (secondary).
4. Complete accessibility pass.
5. Add tests and demo fixtures.
6. Rehearse end-to-end demo.

---

## Testing and Acceptance Criteria

### Critical Test Scenarios
1. Allergen conflict recipe is always blocked.
2. Restricted technique/tool recipe is always blocked.
3. User with dexterity limits does not receive recipes requiring heavy knife prep.
4. User preference for pre-cut/frozen/canned ingredients increases ranking for matching recipes.
5. User appliance preference (slow cooker/air fryer/Instant Pot) increases ranking for matching recipes.
6. Chips-only recommendation flow works.
7. Text-only recommendation flow works.
8. Chips + text flow works.
9. Empty temporary input triggers profile-only fallback.
10. Unknown text triggers exact inline clarification message.
11. Skip unknown text still returns results (chips-based or profile-only).
12. Every returned recipe includes at least one matching reason.
13. Keyboard-only user can complete core flow.
14. If recipe includes source alternatives, user sees them clearly in detail/playbook view.
15. Unsafe alternatives (allergen/excluded) are never shown even if present in source.
16. If no source alternatives exist, app does not fabricate substitutions in MVP.

### MVP Acceptance Criteria
- User can create, save, and edit profile.
- Recommendations support chip/text/both input.
- No temporary input still returns personalized profile-based results.
- Hard safety constraints are always enforced.
- Unknown intent flow supports Clarify and Skip.
- Source-provided ingredient alternatives are shown when safe and hidden when unsafe.
- Core demo works reliably in under 90 seconds.

---

## Stretch Goals
- Smart sharing links for original and playbook views.
- More advanced automated faithfulness checks for transformed recipes.
- Hands-free kitchen optimizations (voice/large touch targets).
- Anti-scraping resiliency experiments for difficult recipe sources.
- Grocery list view:
  - Generate a combined shopping list from one or more selected recipes.
  - Group items by common store sections for quick in-store scanning (example: produce, meat/seafood, dairy/eggs, frozen, canned/jarred, dry goods, spices, bakery, beverages, household/misc).
  - Deduplicate similar items and preserve quantity notes where possible.
  - Respect hard safety constraints and selected substitutions when building the final list.
- Audio Playbook readout mode for low-vision/blind users:
  - Optional listening-first recipe mode that reorganizes instructions for audio-only use.
  - Agent/formatted output should chunk steps into short, ear-friendly segments with explicit actions and ingredient amounts.
  - Navigation controls: `Next`, `Back`, `Repeat`, and `Pause/Resume`.
  - Browser TTS first with cloud TTS fallback for reliability.
  - Save readout defaults (voice, rate, chunk size) in persistent user profile.
