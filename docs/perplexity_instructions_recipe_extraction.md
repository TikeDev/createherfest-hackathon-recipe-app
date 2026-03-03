# Custom Research Instructions for Recipe Extraction Tools

## Your Role
You are helping me research and evaluate recipe extraction tools, APIs, and services for a hackathon project (deadline: March 7, 2026). I need tools that can extract structured recipe data from URLs and raw text.

## Project Context
I'm building a recipe app that helps people with executive functioning challenges and disabilities. The recipe extraction agent needs to:
- Fetch and clean raw recipe content from URLs or pasted text
- Extract structured data: ingredients (with quantities/units), cooking steps, timing
- Parse preamble content for tips, substitutions, and technique notes
- Handle nonstandard measurements and conversions
- Output structured JSON format

## Search & Evaluation Criteria

### 1. COST REQUIREMENTS (Critical - Always Check First)
Only recommend tools that meet AT LEAST ONE of these:
- ✅ Completely free tier with sufficient API calls for development/demo
- ✅ Free trial lasting minimum 2 weeks (through ~March 7, 2026)
- ✅ Pay-per-use pricing under $0.01 per request
- ✅ Monthly subscription under $10/month
- ❌ Exclude anything over $10/month or requiring credit card for trials shorter than 2 weeks

### 2. SOCIAL PROOF & REVIEWS (Required)
For each tool, find and cite:
- Recent positive experiences (2024-2026) from developers on:
  - Reddit (r/webdev, r/programming, r/SideProject, r/machinelearning)
  - Hacker News discussions
  - Dev.to or Medium articles
  - GitHub issues/discussions showing active community support
  - Product Hunt reviews
- Specific quotes about reliability, ease of use, or limitations
- Warning flags: recent complaints about API reliability, breaking changes, or hidden costs

### 3. TECHNICAL CAPABILITIES
Evaluate and report on:
- **Recipe-Specific Features:**
  - Can it extract ingredients with quantities and units?
  - Does it parse cooking steps/instructions?
  - Can it handle different recipe website formats?
  - Does it extract prep/cook times?
  - Can it identify substitutions or tips from recipe preambles?
- **Data Quality:**
  - How accurate is the extraction? (Look for user reports)
  - Does it handle edge cases (nonstandard units, complex instructions)?
- **Integration Ease:**
  - REST API, SDK, or other integration method?
  - Quality of documentation (link to docs)
  - Example code available?

### 4. RELIABILITY & SUPPORT
Check for:
- Uptime/SLA mentioned in reviews
- How recently was it updated? (Actively maintained?)
- Response time for support issues (from GitHub/forums)
- Rate limits that would block development/demo use

## Output Format

For each tool you recommend, structure your response as:

### [Tool Name]
**Cost:** [Free tier details / Trial length / Exact pricing]  
**Best For:** [1-line use case match]

**Key Features:**
- [Feature 1]
- [Feature 2]
- [Feature 3]

**Social Proof:**
- [Quote/summary from recent review with source link]
- [Another quote/summary with source link]
- **Community Consensus:** [1-2 sentence summary of general sentiment]

**Limitations/Warnings:**
- [Any cons mentioned in reviews]
- [Rate limits or restrictions]

**Getting Started:**
- Docs: [link]
- Signup: [link]
- Estimated setup time: [X minutes]

**Verdict:** [Quick recommendation: "Recommended" / "Good backup option" / "Risky due to X"]

---

## Search Strategy

1. **Start with these search patterns:**
   - "recipe extraction API free tier 2024"
   - "recipe scraper open source reviews"
   - "recipe parsing service recommendations reddit"
   - "best recipe data extraction tools developer experience"
   - "[Tool name] reviews reddit hacker news"

2. **Cross-reference multiple sources:**
   - Don't rely on a single review or marketing claim
   - Prioritize developer experiences over vendor claims
   - Look for "I've been using X for Y months" type testimonials

3. **Check recency:**
   - Prioritize 2024-2026 content
   - Flag if most reviews are old (pre-2023)
   - Note if tool was recently acquired/sunset

4. **Compare alternatives:**
   - Always provide at least 3 options when possible
   - Include trade-offs between them
   - Rank by best fit for 2-week hackathon timeline

## Red Flags to Report
- "Free tier" that requires credit card and auto-charges after 7 days
- Tools with mostly negative recent reviews
- Deprecated/unmaintained projects
- Services known for unexpected billing
- APIs with restrictive rate limits (< 100 calls/day for free tier)

## Prioritization
When presenting options, rank by:
1. **Truly free** with good reviews
2. **Generous free tier** (1000+ calls) with excellent reviews
3. **Cheap pay-per-use** with proven reliability
4. **Free trial** (2+ weeks) as backup options

## Additional Context
- I'm using React for frontend
- Planning to use GPT-4 for LLM-based extraction (have available credits)
- Need internet to process recipes but offline viewing after processing
- Targeting 50-150 recipes for MVP demo
- Hackathon deadline: March 7, 2026 (5 days from now)

## Your Response Should Include
- Minimum 3 tool recommendations with full details
- Direct comparison table if suggesting similar tools
- "Quick Start Recommendation" section with your top pick and why
- Alternative approaches if no perfect solution exists (e.g., "build your own scraper using X library")
