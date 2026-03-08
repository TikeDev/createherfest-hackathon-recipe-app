/**
 * suggestionAgent.ts
 * ─────────────────────────────────────────────────────────────
 * Single-call LLM agent for semantic recipe suggestions.
 *
 * This is NOT an agentic tool loop — it's one structured-output
 * inference call. The model reads a compact recipe summary and the
 * user's note, then ranks the best matches.
 *
 * Hard filters (allergens, tool restrictions, energy level) are applied
 * client-side BEFORE the LLM call, so the model only ever sees
 * recipes that are safe for this user.
 *
 * Falls back to the pure suggestRecipes function if:
 *   - VITE_OPENAI_API_KEY is not set
 *   - The API call fails (offline, rate limit, parse error)
 * ─────────────────────────────────────────────────────────────
 */

import OpenAI from "openai";
import type { RecipeJSON } from "@/types/recipe";
import type { UserProfile } from "@/types/profile";
import { hardFilterRecipes, suggestRecipes } from "@/lib/suggestRecipes";

export interface SmartSuggestion {
  recipe: RecipeJSON;
  reason: string;
  /** true = LLM-generated reason, false = rule-based fallback */
  isSmart: boolean;
}

// ─── Prompt ───────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a compassionate recipe matching assistant for an accessible cooking app.
Users may have physical or cognitive limitations. Your job is to pick the best 1–3 recipes from a provided list given what the user said about how they feel today.

Rules:
- Only return recipeIds that appear in the provided list — never invent IDs.
- The reason must be warm, encouraging, and under 15 words.
- Fewer suggestions are fine if the note is vague or no recipes are a strong match.
- Return valid JSON only. No markdown, no explanation outside the JSON object.

Return format: { "suggestions": [{ "recipeId": "...", "reason": "..." }] }`;

function buildUserMessage(energyLabel: string, note: string, recipes: RecipeJSON[]): string {
  const recipeList = recipes
    .map((r) => {
      const cs = r.metadata.cognitiveScore;
      const time = r.metadata.totalTimeMinutes ? `${r.metadata.totalTimeMinutes} min` : null;
      const topIngredients = r.ingredients
        .slice(0, 6)
        .map((i) => i.name)
        .join(", ");
      const meta = [cs != null ? `complexity ${cs}/3` : null, time].filter(Boolean).join(", ");
      return `- ID: "${r.id}" | "${r.title}" | ${meta} | ingredients: ${topIngredients}`;
    })
    .join("\n");

  const lines = [
    `Energy level today: ${energyLabel}`,
    note ? `User said: "${note}"` : "User did not add a note.",
    "",
    "Available recipes (already filtered for safety):",
    recipeList,
  ];

  return lines.join("\n");
}

// ─── Main export ──────────────────────────────────────────────

export async function runSuggestionAgent(
  energyLevel: 1 | 2 | 3,
  note: string,
  recipes: RecipeJSON[],
  profile: UserProfile | null
): Promise<SmartSuggestion[]> {
  // Step 1 — apply hard filters client-side before LLM ever sees the pool
  const filtered = hardFilterRecipes(recipes, energyLevel, profile);

  if (filtered.length === 0) return [];

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  if (!apiKey) throw new Error("VITE_OPENAI_API_KEY not set");

  // Step 2 — single structured-output LLM call
  const energyLabels: Record<1 | 2 | 3, string> = { 1: "low", 2: "medium", 3: "high" };
  const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  const response = await client.chat.completions.create({
    model: "gpt-5-nano",
    max_completion_tokens: 400,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserMessage(energyLabels[energyLevel], note, filtered) },
    ],
    response_format: { type: "json_object" },
  });

  // Step 3 — parse, validate, and map back to recipe objects
  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as { suggestions?: { recipeId: string; reason: string }[] };

  const validIds = new Set(filtered.map((r) => r.id));
  const recipeMap = new Map(filtered.map((r) => [r.id, r]));

  return (parsed.suggestions ?? [])
    .filter(
      (s) =>
        typeof s.recipeId === "string" &&
        validIds.has(s.recipeId) &&
        typeof s.reason === "string" &&
        s.reason.length > 0
    )
    .slice(0, 3)
    .map((s) => ({
      recipe: recipeMap.get(s.recipeId)!,
      reason: s.reason,
      isSmart: true,
    }));
}

// ─── Fallback wrapper ─────────────────────────────────────────

/**
 * Tries the LLM agent, falls back to the pure suggestRecipes function when:
 *   - VITE_OPENAI_API_KEY is not set
 *   - The API call fails (offline, rate limit, parse error)
 *   - The agent returns empty results — e.g. it hallucinated or mangled recipe
 *     IDs so all candidates failed ID validation. This is common with small
 *     models on long string IDs and must not silently return nothing.
 */
export async function runSuggestionAgentWithFallback(
  energyLevel: 1 | 2 | 3,
  note: string,
  recipes: RecipeJSON[],
  profile: UserProfile | null
): Promise<SmartSuggestion[]> {
  try {
    const smart = await runSuggestionAgent(energyLevel, note, recipes, profile);
    if (smart.length > 0) return smart;
    // Agent succeeded but returned nothing usable — fall through to pure function
  } catch {
    // API/network/parse error — fall through to pure function
  }

  const fallback = suggestRecipes(note, energyLevel, recipes, profile);
  return fallback.map((s) => ({
    recipe: s.recipe,
    reason: s.matchReasons[0] ?? "",
    isSmart: false,
  }));
}
