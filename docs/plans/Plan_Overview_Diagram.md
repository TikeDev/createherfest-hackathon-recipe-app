<!-- Last updated at commit: 26eff09 (26eff093078e89e93dfd2536b65f0de122e5c15e) on 2026-03-07 | branch: main -->
# Simmer Plan Overview

## Table of Contents

- [🧩 1) User Inputs and Modes](#1-user-inputs-and-modes)
- [💬 2) Text Intent Handling](#2-text-intent-handling)
- [🔍 3) Recommendation Pipeline](#3-recommendation-pipeline)
- [🔊 4) Stretch Goal: Audio Playbook](#4-stretch-goal-audio-playbook)
- [🛒 5) Grocery List View](#5-grocery-list-view-built--now-in-cookingmode)
- [📅 6) Two-Week Delivery Timeline](#6-two-week-delivery-timeline)
- [🍳 7) CookingMode Flow](#7-cookingmode-flow-built)
- [🤖 8) Extraction Agent Flow](#8-extraction-agent-flow-built)
- [🗺️ Legend](#legend)

---

## 1) User Inputs and Modes
```mermaid
%%{init: {"flowchart": {"useMaxWidth": true, "htmlLabels": true}} }%%
flowchart TD
    A[User] --> B[Persistent Profile]
    B --> B1[Allergies + diet]
    B --> B2[Disability settings]
    B --> B3[Dexterity + tools]
    B --> B4[Optional audio defaults]

    A --> C[Session input]
    C --> C1[State chips]
    C --> C2[Free text]
    C --> C3[Both]
    C --> C4[Neither]

    C1 --> D[Profile + state mode]
    C2 --> D
    C3 --> D
    C4 --> E[Profile-only mode]

    classDef user fill:#E8F1FF,stroke:#2F5DA8,color:#0F274D,stroke-width:1px;
    classDef profile fill:#EAFBF1,stroke:#2E8B57,color:#103B24,stroke-width:1px;
    classDef session fill:#FFF5E8,stroke:#C77700,color:#5A3300,stroke-width:1px;
    classDef mode fill:#F2ECFF,stroke:#6D4BC2,color:#2B1A57,stroke-width:1px;

    class A user;
    class B,B1,B2,B3,B4 profile;
    class C,C1,C2,C3,C4 session;
    class D,E mode;
```

## 2) Text Intent Handling
```mermaid
%%{init: {"flowchart": {"useMaxWidth": true, "htmlLabels": true}} }%%
flowchart TD
    A[Free text submitted] --> B{Intent confidence high?}
    B -->|Yes| C[Use text in scoring]
    B -->|No| D[Show: Clarify or Skip]
    D -->|Clarify| E[User rewrites text]
    E --> B
    D -->|Skip| F{Any state chips?}
    F -->|Yes| G[Continue with chips]
    F -->|No| H[Fallback to profile-only]

    classDef input fill:#E8F1FF,stroke:#2F5DA8,color:#0F274D,stroke-width:1px;
    classDef decision fill:#FFF6D6,stroke:#B8860B,color:#4A3500,stroke-width:1px;
    classDef action fill:#EAFBF1,stroke:#2E8B57,color:#103B24,stroke-width:1px;
    classDef fallback fill:#FDECEC,stroke:#C94A4A,color:#5A1717,stroke-width:1px;

    class A input;
    class B,F decision;
    class C,D,E,G action;
    class H fallback;
```

## 3) Recommendation Pipeline
```mermaid
%%{init: {"flowchart": {"useMaxWidth": true, "htmlLabels": true}} }%%
flowchart TD
    A[Recommendation engine] --> B[Hard filters]
    B --> B1[Block allergens]
    B --> B2[Block excluded ingredients]
    B --> B3[Block restricted tools/techniques]
    B --> B4[Block heavy knife prep when strict]

    B --> C[Soft scoring]
    C --> C1[Time + energy + mood]
    C --> C2[Sensory + cleanup + cost]
    C --> C3[Prep assist fit<br/>pre-cut, frozen, canned]
    C --> C4[Appliance fit<br/>slow cooker, air fryer, Instant Pot]

    C --> D[Ranked results]
    D --> D1[Why this fits you]
    D --> D2[Recipe detail + Playbook]
    D2 --> E[Source-provided alternatives]
    E --> E1{Alternative is safe?}
    E1 -->|Yes| E2[Show optional substitute]
    E1 -->|No| E3[Hide substitute]
    D2 --> E4[No source alternatives]
    E4 --> E5[Do not fabricate substitutes]

    classDef engine fill:#E8F1FF,stroke:#2F5DA8,color:#0F274D,stroke-width:1px;
    classDef hard fill:#FDECEC,stroke:#C94A4A,color:#5A1717,stroke-width:1px;
    classDef soft fill:#EAFBF1,stroke:#2E8B57,color:#103B24,stroke-width:1px;
    classDef output fill:#F2ECFF,stroke:#6D4BC2,color:#2B1A57,stroke-width:1px;
    classDef decision fill:#FFF6D6,stroke:#B8860B,color:#4A3500,stroke-width:1px;

    class A engine;
    class B,B1,B2,B3,B4 hard;
    class C,C1,C2,C3,C4 soft;
    class D,D1,D2,E,E2,E3,E4,E5 output;
    class E1 decision;
```

## 4) Stretch Goal: Audio Playbook
```mermaid
%%{init: {"flowchart": {"useMaxWidth": true, "htmlLabels": true}} }%%
flowchart TD
    A[Audio Playbook mode] --> B[Chunk instructions for listening]
    B --> C[Short ear-friendly steps]
    C --> D[Controls: Next, Back, Repeat, Pause]
    D --> E[Browser TTS]
    E --> F{TTS available?}
    F -->|Yes| G[Read aloud]
    F -->|No| H[Cloud TTS fallback]

    classDef audio fill:#EAFBF1,stroke:#2E8B57,color:#103B24,stroke-width:1px;
    classDef control fill:#FFF5E8,stroke:#C77700,color:#5A3300,stroke-width:1px;
    classDef decision fill:#FFF6D6,stroke:#B8860B,color:#4A3500,stroke-width:1px;
    classDef fallback fill:#F2ECFF,stroke:#6D4BC2,color:#2B1A57,stroke-width:1px;

    class A,B,C,G audio;
    class D,E control;
    class F decision;
    class H fallback;
```

## 5) Grocery List View [Built — now in CookingMode]
```mermaid
%%{init: {"flowchart": {"useMaxWidth": true, "htmlLabels": true}} }%%
flowchart TD
    A[Selected recipes] --> B[Extract ingredients]
    B --> C[Normalize names + units]
    C --> D[Deduplicate similar items]
    D --> E[Apply safe substitutions]
    E --> F[Group by store section]
    F --> F1[Produce]
    F --> F2[Meat/Seafood]
    F --> F3[Dairy/Eggs]
    F --> F4[Frozen]
    F --> F5[Canned/Jarred]
    F --> F6[Dry goods + spices]
    F --> F7[Bakery + beverages + misc]
    F --> G[Skimmable grocery list]

    classDef input fill:#E8F1FF,stroke:#2F5DA8,color:#0F274D,stroke-width:1px;
    classDef process fill:#EAFBF1,stroke:#2E8B57,color:#103B24,stroke-width:1px;
    classDef output fill:#F2ECFF,stroke:#6D4BC2,color:#2B1A57,stroke-width:1px;

    class A input;
    class B,C,D,E,F,F1,F2,F3,F4,F5,F6,F7 process;
    class G output;
```

## 6) Two-Week Delivery Timeline
```mermaid
%%{init: {"timeline": {"useMaxWidth": true}} }%%
timeline
    title Two-Week Delivery Plan
    Week 1 : Schemas + validation
           : Profile setup/edit
           : Session input UI
           : Curated recipe tagging
           : Hard filters + baseline scorer
           : Results list with reasons
    Week 2 : Text intent + clarify/skip
           : Recipe detail + playbook
           : Optional URL import path
           : Accessibility pass
           : Tests + demo fixtures
           : End-to-end rehearsal
```

## 7) CookingMode Flow [Built]
```mermaid
%%{init: {"flowchart": {"useMaxWidth": true, "htmlLabels": true}} }%%
flowchart TD
    A[Recipe Detail] --> B[Start Cooking]
    B --> C[CookingMode]
    C --> C1[Step navigator<br/>prev / next]
    C --> C2[Countdown timer<br/>per-step timing]
    C --> C3[Grocery list tab<br/>via classifyGroceries.ts]

    C2 --> D{Timer reaches zero}
    D --> E[playAlarm from profile settings]
    E --> E1{alarmEnabled?}
    E1 -->|Yes + custom audio| E2[Play custom uploaded sound]
    E1 -->|Yes + built-in| E3[Play gentle / moderate / urgent]
    E1 -->|visualAlarmEnabled| E4[VisualAlarm flashes on screen]
    E1 -->|No| E5[Silent — no alarm]

    C3 --> F[classifyGroceries.ts]
    F --> F1[gpt-5-nano categorizes ingredients]
    F1 --> G[Grouped grocery list<br/>produce, dairy, pantry, etc.]

    classDef page fill:#E8F1FF,stroke:#2F5DA8,color:#0F274D,stroke-width:1px;
    classDef feature fill:#EAFBF1,stroke:#2E8B57,color:#103B24,stroke-width:1px;
    classDef decision fill:#FFF6D6,stroke:#B8860B,color:#4A3500,stroke-width:1px;
    classDef alarm fill:#FDECEC,stroke:#C94A4A,color:#5A1717,stroke-width:1px;
    classDef output fill:#F2ECFF,stroke:#6D4BC2,color:#2B1A57,stroke-width:1px;

    class A,B,C page;
    class C1,C2,C3,F,F1 feature;
    class D,E1 decision;
    class E,E2,E3,E4,E5 alarm;
    class G output;
```

## 8) Extraction Agent Flow [Built]
```mermaid
%%{init: {"flowchart": {"useMaxWidth": true, "htmlLabels": true}} }%%
flowchart TD
    A[User: URL or pasted text] --> B{Input type}
    B -->|URL| C[fetcher.ts<br/>fetch + Readability clean]
    B -->|Pasted text| D[Use raw text directly]
    C --> E[recipeAgent.ts<br/>gpt-5-nano, temp=1, 30-iter cap]
    D --> E

    E --> F[Tool-calling loop]
    F --> F1[extract_preamble<br/>tips, substitutions, technique notes]
    F --> F2[parse_ingredients<br/>name, quantity, unit, UUID]
    F --> F3[extract_steps<br/>index, text, timing, isCritical, UUID]
    F --> F4[convert_volume_to_weight<br/>density lookup, confidence level]
    F --> F5[convert_weight_to_volume<br/>grams → cups/tbsp/tsp]
    F --> F6[validate_output<br/>Zod schema validation]
    F --> F7[map_annotations<br/>Planned — not built]

    F1 & F2 & F3 & F4 & F5 & F6 --> G[Assemble RecipeJSON]
    G --> H[Inject UUID + extractedAt timestamp]
    H --> I[Save to IndexedDB recipes store]
    I --> J[Navigate to RecipeDetail]

    E --> K{Max iterations hit<br/>or offline}
    K --> L[Queue URL in IndexedDB queue store]
    L --> M[Show raw text while offline]

    classDef input fill:#E8F1FF,stroke:#2F5DA8,color:#0F274D,stroke-width:1px;
    classDef agent fill:#FFF5E8,stroke:#C77700,color:#5A3300,stroke-width:1px;
    classDef tool fill:#EAFBF1,stroke:#2E8B57,color:#103B24,stroke-width:1px;
    classDef output fill:#F2ECFF,stroke:#6D4BC2,color:#2B1A57,stroke-width:1px;
    classDef fallback fill:#FDECEC,stroke:#C94A4A,color:#5A1717,stroke-width:1px;
    classDef planned fill:#F5F5F5,stroke:#999,color:#555,stroke-width:1px,stroke-dasharray:4 4;

    class A,B input;
    class C,D,E,F agent;
    class F1,F2,F3,F4,F5,F6 tool;
    class F7 planned;
    class G,H,I,J output;
    class K,L,M fallback;
```

Legend:
- Blue: user/input context
- Green: primary actions and scoring
- Yellow: decisions
- Red: safety or fallback constraints
- Purple: outputs, modes, and fallback systems
- Grey dashed: planned but not yet built
