# **\#75HER Challenge: 4-Line Problem Frame**

**Project Name:** \[Insert Project Name\]

**Team Name:** \[Insert Team Name\]

---

## **💡 Purpose & Instructions**

**Purpose:** Define the core of your project before writing a single line of code. This frame becomes the foundation of your README, DevPost description, demo video, and Decision Log Entry \#1.

**The Golden Rule:** If you can't fill out all four lines clearly and specifically, you're not ready to build yet. Complete this first — everything else follows from here.

---

## **🧩 Your 4-Line Problem Frame**

| Line | Prompt | Your Answer |
| :---- | :---- | :---- |
| **1\. User** | **Who specifically** has this problem?  | Individuals with executive functioning challenges who love to cook but want a recipes that adapt to their brain’s contradictory need for novelty while also providing a structure that simplifies cooking  |
| **2\. Problem** | What friction, gap, or pain does that user experience? (**Describe the problem, not your solution**) | Choosing recipes according to their changing level of energy/focus and following recipes with complex asynchronous steps |
| **3\. Constraints** | What limits your solution? (Time, tools, budget, accessibility needs — **be honest**) | Time and budget  |
| **4\. Success Test** | How will a judge know it works? (One observable, measurable outcome in your demo) | Pick a recipe according to energy level and successfully go through all recipe’s steps sequentially with the ability to navigate back and forth between steps.Have the current step in view while all other hidden   |

---

## **🤖 AI Pressure-Test (Required for AI/ML Track)**

Recommended for all tracks to refine your engineering thinking.

**Instructions:** Paste your completed frame into **your LLM of choice** with the following prompt:

"Here is my 4-Line Problem Frame: \[Paste Frame\]. Act as a senior product engineer. What is the riskiest assumption in this frame? What is the simplest working version I can build in 3 weeks that proves my Success Test?"

| AI Tool Used | Prompt Summary | Key AI Output | What You Decided | Why |
| :---- | :---- | :---- | :---- | :---- |
| chat-gpt | \[Summarize prompt\] "Here is my 4-Line Problem Frame: \[Frame above\]. Act as a senior product engineer. What is the riskiest assumption in this frame? What is the simplest working version I can build in 3 weeks that proves my Success Test?" | \[AI's suggestion\] **Riskiest assumption (AI/ML version):** your app can accurately interpret a user’s current state (energy/focus/time/novelty) well enough to recommend a recipe they’ll actually choose and complete. **Best MVP for AI/ML track:** keep the core UX simple (recipe suggestions \+ one-step-at-a-time cooking mode with Back/Next), and add **one AI feature**: a natural-language input (“How are you feeling?”) that maps to tags and drives recommendations. **Implementation approach:** use an LLM (or simple NLP heuristic) to convert user text into structured tags, then use **transparent rule-based ranking** on a small hardcoded recipe set (6–9 recipes) to return the top 2–3 matches.  | \[What you kept/changed\] Decided to add the NLP for input for recipe suggestions instead of energy mode, also added some suggestions to make it easy and fluid | \[Your reasoning\] Natural Language is more intuitive and lower friction for a user with executive challenges. Also allows to get input into the food they want to taste  |

**Note:** AI output is a starting point. Documenting your changes here proves you are "augmenting, not abdicating" your project's critical thinking.

---

## 

## 

## 

## 

## 

## 

## 

## **🔍 Problem Frame Quality Check**

Before moving to build, verify your frame passes these checks:

| Check | Question | ✅ Pass / ❌ Fix |
| :---- | :---- | :---- |
| **Specific User** | Is your user a real, identifiable group — not a vague demographic? | Pass |
| **Real Problem** | Does this describe friction/pain — not a feature or technology? | Pass |
| **Honest Constraints** | Do constraints reflect your actual skill level and 75-day timeline? \+1 |  |
| **Observable Success** | Can a judge verify your success test by watching a 5-minute demo? | Pass |

---

## **✅ Submission Checklist**

- [ ] All four lines are filled in with specific, non-vague answers.  
- [ ] Success Test is observable and demonstrable in your demo video.  
- [ ] AI pressure-test (if used) is logged in the table above.  
- [ ] Problem Frame is copied into your **README** and **DevPost** description.  
- [ ] No "TBD" or placeholder text remains.

---

**📌 Where This Goes Next:** Once complete, copy this frame into your **README** (Overview), your **DevPost** description, and your **Decision Log** as Entry \#1.

Part of the \#75HER Challenge | CreateHER Fest 2026

