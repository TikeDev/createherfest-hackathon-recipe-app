# Simmer — Brand Guide

> **#75HER Challenge | CreateHER Fest 2026 | AI/ML Track**  
> Version 1.0 — March 2026

---

## Brand Identity

**App Name:** Simmer  
**Direction:** The Calm Coach  
**Concept:** A steady, grounding presence. Feels like a patient mentor beside you in the kitchen — never rushed, never overwhelming.  
**Tagline:** *Take your time. We've got the steps.*  
**Elevator Pitch:** A cooking app that guides people with executive functioning challenges through every stage of cooking — one calm step at a time.

---

## Brand Heart

| | |
|---|---|
| **Purpose** | To make real cooking feel possible for brains that work differently. |
| **Promise** | Users can always count on calm, clear guidance — no overwhelm, no walls of text, no judgment. |
| **Positioning** | Simmer is the only cooking app that manages cognitive load at every stage of the process, so the user never has to. |

---

## Color Palette

| Role | Name | Hex | Usage |
|---|---|---|---|
| Primary | Sage Green | `#6B9E78` | CTAs, active states, app name, progress indicators |
| Background | Warm Cream | `#FAF4EF` | Page backgrounds, cards |
| Accent | Mist Green | `#A8C5B0` | Timers, progress bars, stage transitions, borders |
| Text | Deep Forest | `#2D3B35` | All body text, headings |
| Surface | Light Sage | `#EEF5F0` | Tags, chips, secondary surfaces |
| Error | Warm Amber | `#FFB347` border · `#FFF7ED` bg · `#B85C00` text | Error states, warnings |

### Usage Rules

- **Never** use sage green as a text color on cream — use Deep Forest (`#2D3B35`) for all body copy.
- **Never** use white backgrounds — always Warm Cream (`#FAF4EF`) as the base.
- The primary CTA button is always Sage Green (`#6B9E78`) with white text.
- Accent Mist Green (`#A8C5B0`) is for supporting elements only — never for primary actions.

---

## Typography

| Role | Font | Weight | Size guidance |
|---|---|---|---|
| Headlines / App name | Lora | Bold (700) | 28–36px for h1, 20–24px for h2 |
| Body / UI text | Nunito | Regular (400), SemiBold (600) | 14–16px base |
| Labels / Tags | Nunito | SemiBold (600) | 11–12px, tracking widest |

**Import (Google Fonts):**
```html
<link href="https://fonts.googleapis.com/css2?family=Lora:wght@700&family=Nunito:wght@400;600&display=swap" rel="stylesheet">
```

**Tailwind config:**
```js
fontFamily: {
  headline: ['Lora', 'serif'],
  body: ['Nunito', 'sans-serif'],
}
```

### Typography Rules

- Headlines are always in **Lora serif** — never Nunito.
- Body copy is always **Nunito** — never Lora.
- Use **short sentences**. One idea per line in cooking mode.
- **Never** set body text smaller than 14px.
- **Never** use all-caps for anything longer than a label.

---

## Voice & Tone

**Three words:** Warm · Calm · Quietly Confident

Simmer speaks like a wise friend in the kitchen. Short sentences. Lots of breathing room. It celebrates small wins without making a big deal of them. It never rushes the user and never uses clinical or mechanical language.

### We Say / We Never Say

| ✅ We say | ❌ We never say |
|---|---|
| "Take your time." | "Complete the required steps." |
| "You've got this." | "Optimize your workflow." |
| "Nice work. Next step." | "Error. Please retry." |
| "I'm ready. Next step →" | "Proceed to next phase." |
| "No worries — let's try that again." | "Invalid input detected." |
| "You're doing great." | "Task completed successfully." |

### Tone by Context

| Context | Tone |
|---|---|
| Step instructions | Direct, plain-language, one action per sentence |
| Error / retry states | Warm, zero blame, immediate path forward |
| Stage transitions | Brief, encouraging, never over-the-top |
| Completion screen | Quiet pride — not fanfare |
| Empty / loading states | Calm, present — "Simmer is thinking..." |

---

## UI Microcopy

| Element | Copy |
|---|---|
| Primary CTA | "I'm ready. Next step →" |
| Loading state | "Simmer is thinking..." |
| Error state | "No worries — let's try that again." |
| Progress nudge | "You're doing great." |
| Completion screen | "Meal done. You made that. 🌿" |
| No recipe match | "Nothing in our kitchen matches that yet." |
| Suggest a recipe CTA | "Suggest this dish →" |
| Retry prompt | "Want to describe it differently?" |

---

## Logo Direction

Rounded wordmark in Sage Green (`#6B9E78`). Soft, organic letterforms. Optional small leaf or steam motif — never a chef's hat or kitchen clipart. The name "Simmer" should feel hand-lettered and grounded, not techy.

**Logo don'ts:**
- No gradients on the wordmark
- No drop shadows
- No busy icon next to the wordmark — keep it text-forward

---

## Spacing & Layout

- **Breathing room is a feature.** Generous padding at every level — minimum `24px` vertical between sections.
- Single-column layout in cooking mode. Nothing competes with the current step.
- One primary action visible at a time — never two CTA buttons at the same level.
- Mobile-first. All layouts stack vertically on small screens without loss of clarity.

---

## Animation & Motion

- All page transitions: **250ms ease fade** — nothing faster, nothing more dramatic.
- Loading states: **slow CSS pulse** on the app name or a quiet dot animation. No spinners.
- Stage transitions: **subtle slide** (200ms) — step comes in from the right, exits left.
- **No** bounce effects, no confetti, no celebratory animations mid-cooking (they break focus).
- Completion screen is the one place a gentle fade-in with a soft icon is appropriate.

---

## Accessibility Baseline

- All text must meet **WCAG AA contrast** (4.5:1 minimum for body, 3:1 for large text).
- Deep Forest on Warm Cream: `#2D3B35` on `#FAF4EF` — contrast ratio **~9.5:1** ✅
- White on Sage Green: `#FFFFFF` on `#6B9E78` — contrast ratio **~4.6:1** ✅
- All interactive elements keyboard-navigable.
- All images have meaningful `alt` text.
- Reading level: **Grade 8 or below** for all user-facing copy.
- Font size: **never below 14px** in the UI.

---

## Component Quick Reference

```
Landing page:     Warm Cream bg · Lora headline · single centered input · one sage CTA
Recipe cards:     White bg · Lora title · Nunito meta · sage energy badge · mist border
Cooking mode:     Warm Cream bg · one step visible · sage progress bar · mist stage label
Error states:     Amber border · light amber bg · amber-dark text · no red
Completion:       Warm Cream bg · Lora headline · single sage CTA · 🌿 icon
```

---

## Brand in One Sentence

Simmer is what it feels like when someone genuinely calm and capable is standing next to you in the kitchen, making sure you never have to hold the whole recipe in your head at once.

---

*Built with ❤️ for #75HER Challenge | CreateHER Fest 2026*