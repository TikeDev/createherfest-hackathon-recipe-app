# **\#75HER Challenge: AI Trace Log Example**

## **Example Document with Realistic Entries**

Project Name: EcoTrack \- Personal Carbon Footprint Calculator  
Team Name: Green Guardians

---

## **💡 Purpose & Principles**

Purpose: Document how you utilized AI tools (goose, Claude, ChatGPT, etc.) to prove you "augmented, not abdicated" your responsibilities. This log demonstrates that while AI helped speed up your process, you owned the critical thinking, final choices, and implementation.

Judges are looking for:

* What you asked the AI to do  
* What the AI suggested vs. what you actually kept or changed  
* How you verified the accuracy of the AI's output

---

## **🤖 AI Trace Entries**

## **Trace \#1: Code Generation \- API Integration**

* Tool: Goose (Claude Sonnet 4.5)  
* Prompt: "Create a Python function to fetch electricity emission factors from the EPA's API, handle rate limits, and cache responses for 24 hours"  
* AI Response: AI generated a function using the requests library with basic error handling, a simple in-memory cache using a dictionary, and a 60-second timeout. The function included try-except blocks for network errors and JSON parsing.  
* ✅ What You Kept: The basic API call structure, error handling pattern, and timeout configuration were solid and worked well for our use case.  
* ✏️ What You Changed:  
  * Replaced in-memory dictionary cache with redis for persistence across server restarts  
  * Added exponential backoff retry logic (3 attempts) instead of single-try  
  * Implemented API key rotation to handle multiple keys for higher rate limits  
  * Added logging with timestamps for debugging API issues  
* 🔍 Verification: Tested with 100 API calls over 2 hours. Confirmed cache hit rate of 87% and zero rate limit errors. Verified data accuracy by manually comparing 10 random responses against EPA website values.

---

## **Trace \#2: Research & Content \- Carbon Calculation Methodology**

* Tool: Claude Opus 4.5 (via Perplexity AI)  
* Prompt: "What's the standard methodology for calculating household carbon emissions from electricity usage? Include formulas and authoritative sources."  
* AI Response: AI provided formulas for converting kWh to CO2 emissions using emission factors, referenced EPA and IPCC guidelines, and suggested using regional grid mix data. It explained the formula: CO2 \= kWh × Emission Factor (kg CO2/kWh) × Grid Mix Adjustment.  
* ✅ What You Kept: The core formula structure and the recommendation to use regional emission factors rather than national averages for accuracy.  
* ✏️ What You Changed:  
  * Cross-referenced all emission factors against EPA's eGRID2024 database directly  
  * Updated grid mix percentages with 2026 data (AI provided 2022 data)  
  * Added lifecycle emissions (upstream fuel production) based on IPCC AR6 methodology, which AI didn't initially include  
  * Simplified formula explanation for non-technical users in our UI  
* 🔍 Verification: Cross-checked all statistics and formulas against primary sources: EPA eGRID documentation and IPCC AR6 report Chapter 5\. All references documented in Evidence Log with URLs and access dates.

---

## **Trace \#3: Code Generation \- Data Visualization**

* Tool: ChatGPT-4 (via OpenAI API)  
* Prompt: "Create a D3.js chart showing monthly carbon emissions as a bar chart with color gradient from green (low) to red (high), responsive design, and accessible"  
* AI Response: AI generated a D3.js visualization with SVG bar chart, linear color scale, basic responsive width adjustment using window resize listener, and basic axis labels.  
* ✅ What You Kept: The overall D3.js structure, SVG approach, and color scale concept were good starting points.  
* ✏️ What You Changed:  
  * Replaced continuous color gradient with 3 distinct color zones (below average, average, above average) for better readability  
  * Added ARIA labels, role="img", and a screen-reader-accessible data table alternative  
  * Implemented proper responsive behavior using ResizeObserver instead of window.resize for better performance  
  * Added keyboard navigation to highlight individual bars with arrow keys  
  * Included focus indicators and tooltip on hover/focus for data values  
* 🔍 Verification: Tested with WAVE accessibility extension (0 errors, 0 contrast errors). Verified keyboard navigation with screen reader (NVDA on Windows). Tested responsive behavior on devices from 320px to 1920px width.

---

## **Trace \#4: Debugging \- Memory Leak Investigation**

* Tool: Claude Sonnet 4.5 (via Claude.ai)  
* Prompt: "My Node.js backend is experiencing memory leaks. Here's the memory profile snapshot \[shared data\]. What are the likely causes and how do I fix it?"  
* AI Response: AI analyzed the memory profile and identified that event listeners weren't being properly removed, causing references to accumulate. Suggested using removeEventListener and implementing cleanup in a destroy() method. Also noted potential issues with unclosed database connections.  
* ✅ What You Kept: The diagnosis about event listeners was correct and the cleanup pattern suggestion was helpful.  
* ✏️ What You Changed:  
  * Discovered the actual leak was in Redis connection pooling (not mentioned by AI initially)  
  * Implemented connection pool limits and proper cleanup on process termination  
  * Added the event listener fixes AI suggested as bonus improvements  
  * Created a monitoring dashboard to track memory usage over time (my own addition)  
* 🔍 Verification: Ran load testing with 1,000 concurrent users for 2 hours. Memory usage stabilized at 450MB (previously grew unbounded to 2GB+). Confirmed no memory leaks using Chrome DevTools heap snapshots.

---

## **Trace \#5: Design Decision \- User Onboarding Flow**

* Tool: Goose (Claude Sonnet 4.5)  
* Prompt: "Design a user onboarding flow for first-time users of a carbon calculator app. Consider low-tech literacy users and mobile-first design."  
* AI Response: AI suggested a 5-step wizard with progress indicator, tooltips for technical terms, skip option, and email opt-in at the end. Recommended using illustrations instead of text-heavy explanations.  
* ✅ What You Kept: The 5-step progressive disclosure approach and the idea of using visual illustrations worked well for our user base.  
* ✏️ What You Changed:  
  * Reduced to 3 steps (user testing showed 5 was too long \- 40% drop-off)  
  * Removed email opt-in from onboarding (moved to settings to reduce friction)  
  * Added "Why do we ask this?" expandable sections instead of tooltips (better for touch screens)  
  * Implemented local storage to save progress (AI didn't suggest this)  
  * Made all steps optional with "Calculate with defaults" button for users who want quick results  
* 🔍 Verification: Conducted user testing with 15 participants (recruited from Discord community). Measured completion rate improvement from 60% (5-step version) to 89% (3-step version). Collected qualitative feedback via post-task survey.

---

## **Trace \#6: Accessibility Review \- WCAG Compliance**

* Tool: Claude Sonnet 4.5 (via Perplexity AI)  
* Prompt: "Review this HTML form code for WCAG 2.1 AA compliance and suggest improvements for screen reader users"  
* AI Response: AI identified missing form labels, suggested using \<label for="id"\> instead of placeholder text, recommended adding aria-describedby for error messages, and noted color contrast issues on the submit button (failed 4.5:1 ratio).  
* ✅ What You Kept: All label associations and aria-describedby recommendations were implemented. The contrast issue identification was accurate.  
* ✏️ What You Changed:  
  * AI suggested changing button color to \#006400 (dark green), but this failed our brand guidelines  
  * Instead, kept brand color and added white text with 1px shadow for 7.2:1 contrast ratio  
  * Added live region announcements (aria-live="polite") for dynamic error messages (AI didn't mention this)  
  * Implemented focus management to move focus to first error on form submission  
  * Added skip link to bypass navigation (my own accessibility research addition)  
* 🔍 Verification: Ran full WCAG audit using WAVE extension and axe DevTools (0 violations). Tested with NVDA and VoiceOver screen readers. Had 2 blind users from accessibility community test the form flow (recruited via a11y Slack community).

---

## **🚦 Usage Rules & Ethics**

## **✅ The Green Zone (Allowed & Encouraged)**

* Idea Exploration: Brainstorming directions or generating "How-might-we" questions  
* Drafting Scaffolds: Turning your own bullet points into code comments or copy  
* Self-Red-Teaming: Asking AI to identify risks, edge cases, or counter-examples

## **⚠️ The Yellow Zone (Requires Care)**

* Facts & Stats: Must be traceable to public sources and logged in your Evidence Log  
* Code Suggestions: Must include license info and documentation of what you changed

## **🚫 The Red Zone (Prohibited)**

* Fabrications: Do not use unverifiable claims  
* Hidden Automation: Never claim AI-generated work as entirely your own  
* Privacy Violations: Never upload private user data to AI tools

---

