# Recipe Extraction Agent Spec

## Core Functionality
- Users import recipes via URL or paste text
- An in-app agent with tool access processes the recipe and outputs structured JSON
- The agent extracts and preserves preamble content for tips, substitutions, and technique notes

## Data Processing Pipeline
- Fetch and clean raw recipe content from URLs or pasted text
- Extract preamble section and mine it for actionable insights
- Parse ingredients with quantities and units
- Extract cooking steps with timing information
- Flag critical prep requirements like overnight marinades or dough rising
- Map extracted tips and substitutions back to relevant ingredients or steps
- Identify nonstandard units like "hand of garlic" and include brief explanations
- Calculate weight conversions from volume based on ingredient density lookups, with uncertainty flags for specialty items

## Agent Tools
- Extract preamble content for tips and substitutions
- Parse ingredient list with quantities, units, and ingredient names
- Identify cooking steps with timing
- Categorize prep requirements as critical versus standard
- Map annotations and tips to relevant recipe sections
- Look up ingredient density and calculate volume to weight conversions
- Flag conversions with uncertainty notes
- Validate output structure

## Output Format
- Structured JSON with ingredients and steps
- Each ingredient includes a units array with original unit, standard conversion, and explanations for nonstandard measurements
- Each step includes optional annotations, timing, criticality flags, and toggleable tips
- Weight conversions stored with density source and confidence level

## User Features
- Toggle measurement units between metric and imperial
- View and toggle ingredient substitutions from preamble
- Access brief explanations for nonstandard units
- Toggle annotations and tips on steps while cooking
- Check off completed steps
- View raw recipe while offline before processing

## Offline and Queue System
- Users need internet to fetch recipe URLs and process recipes through the agent
- Pasted recipes and URLs queue for processing when internet returns
- Users can view pasted recipes in raw format while offline
- Already-processed recipes display and function fully offline

## Implementation Details
- Using external LLM agent, likely GPT-4o with available credits
- React frontend for UI
- Local storage using IndexedDB or similar for saved recipes
- Processing queue for recipes awaiting agent formatting

## Stretch Goal
- Extract and aggregate recipe reviews to identify common issues or tips multiple reviewers mention, then surface those as warning flags attached to relevant steps