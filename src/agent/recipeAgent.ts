import OpenAI from "openai";
import { randomUUID } from "@/lib/uuid";
import { toolDefinitions, toOpenAITools } from "./toolDefinitions";
import { extractPreamble } from "./tools/extractPreamble";
import { parseIngredients } from "./tools/parseIngredients";
import { extractSteps } from "./tools/extractSteps";
import { convertVolumeToWeight } from "./tools/convertVolumeToWeight";
import { convertWeightToVolume } from "./tools/convertWeightToVolume";
import { validateOutput, parseRecipeJSON } from "./tools/validateOutput";
import type { RecipeJSON } from "@/types/recipe";

const MAX_ITERATIONS = 30;

const SYSTEM_PROMPT = `You are a recipe extraction assistant. Your job is to parse recipe text into structured JSON by calling a sequence of tools, then assembling the final JSON exactly from the tool outputs.

## CRITICAL RULE: Tool outputs are the data. Do not reconstruct them.

When you call a tool, its return value in the "tool" message IS the structured data you must use. Copy it verbatim into the final JSON. Never re-derive, rewrite, or omit fields that a tool returned.

## Step-by-step instructions

Step 1 — Call extract_preamble.
  Pass: the full intro/preamble text from the recipe.
  The tool returns: { raw, tips, substitutions, techniqueNotes }
  This entire object becomes the "preamble" field in the final JSON.

Step 2 — Call parse_ingredients.
  Pass: the full ingredient list.
  The tool returns: an array of ingredient objects. Each object includes:
    - id (a UUID string — copy exactly as returned)
    - raw (original ingredient line verbatim)
    - name, quantity, unit
    - units (array of unit entries)
    - substitutions, annotations
  This entire array becomes the "ingredients" field in the final JSON.

Step 3 — Call extract_steps.
  Pass: all cooking instruction steps.
  The tool returns: an array of step objects. Each object includes:
    - id (a UUID string — copy exactly as returned)
    - index, text, isCritical, criticalNote, timingMinutes, annotations
  This entire array becomes the "steps" field in the final JSON.

Step 4 — For each ingredient with a volume measurement (cups, tablespoons, ml, tsp, etc.):
  Call convert_volume_to_weight with ingredientName, quantity, unit.
  The tool returns a UnitEntry object. Append it to the "units" array of the matching ingredient from Step 2.

Step 5 — For each ingredient with a weight measurement (g, grams, oz, lbs):
  Call convert_weight_to_volume with ingredientName, quantity, unit.
  The tool returns a UnitEntry object. Append it to the "units" array of the matching ingredient from Step 2.

Step 6 — Output the final JSON.
  When all tool calls are complete, output a single JSON code block. Do not call any more tools.

## How to assemble the final JSON

{
  "title": "<recipe title from the text>",
  "sourceUrl": "<URL if provided, otherwise omit>",
  "sourceDomain": "<domain of sourceUrl if provided, otherwise omit>",
  "preamble": <exact object returned by extract_preamble>,
  "ingredients": <exact array returned by parse_ingredients, with units arrays updated by conversion calls>,
  "steps": <exact array returned by extract_steps>,
  "metadata": {
    "totalTimeMinutes": <number or omit if not mentioned>,
    "prepTimeMinutes": <number or omit if not mentioned>,
    "cookTimeMinutes": <number or omit if not mentioned>,
    "servings": "<string or omit if not mentioned>"
  }
}

IMPORTANT: Do NOT include "id" or "extractedAt" at the top level — those are injected by the application.
IMPORTANT: The "id" on each ingredient and each step MUST be copied exactly from the tool output. Do not replace or omit these ids.
IMPORTANT: The "raw" field on each ingredient MUST be copied exactly from the tool output.
IMPORTANT: "units", "annotations", and "substitutions" arrays on each ingredient MUST be copied from the tool output (plus any UnitEntry objects appended in Steps 4–5).
IMPORTANT: The "annotations" array on each step MUST be copied exactly from the tool output.

## Rules for specific fields

- timingMinutes on a step: use the number if timing was mentioned, use null if unknown or not mentioned.
- isCritical on a step: must be true or false (boolean), never null or a string.
- substitutions: NEVER fabricate. Only include substitutions explicitly stated in the source text, as returned by the tools.
- quantity and unit on an ingredient: may be null (e.g. "salt to taste").

## Example of correct assembly

extract_preamble returned:
  { "raw": "This is a forgiving cake.", "tips": ["Use room temp butter"], "substitutions": [], "techniqueNotes": [] }

parse_ingredients returned:
  { "id": "abc-123", "raw": "2 cups all-purpose flour", "name": "all-purpose flour", "quantity": 2, "unit": "cup",
    "units": [{"original": "2 cup", "confidenceLevel": "high"}], "substitutions": [], "annotations": [] }

convert_volume_to_weight returned:
  { "original": "2 cup", "grams": 240, "densitySource": "usda", "confidenceLevel": "high" }

The ingredient in the final JSON must be:
  { "id": "abc-123", "raw": "2 cups all-purpose flour", "name": "all-purpose flour", "quantity": 2, "unit": "cup",
    "units": [
      {"original": "2 cup", "confidenceLevel": "high"},
      {"original": "2 cup", "grams": 240, "densitySource": "usda", "confidenceLevel": "high"}
    ],
    "substitutions": [], "annotations": [] }

Note: "abc-123" is copied from the tool output. The units array has both the original entry and the appended conversion.`;

function buildInitialMessages(
  recipeText: string,
  sourceUrl?: string
): OpenAI.Chat.ChatCompletionMessageParam[] {
  const urlNote = sourceUrl ? `\nSource URL: ${sourceUrl}` : "";
  return [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Please extract this recipe into structured JSON.${urlNote}\n\n---\n\n${recipeText}`,
    },
  ];
}

function dispatchTool(name: string, args: unknown): unknown {
  switch (name) {
    case "extract_preamble":
      return extractPreamble(args as Parameters<typeof extractPreamble>[0]);
    case "parse_ingredients":
      return parseIngredients(args as Parameters<typeof parseIngredients>[0]);
    case "extract_steps":
      return extractSteps(args as Parameters<typeof extractSteps>[0]);
    case "convert_volume_to_weight":
      return convertVolumeToWeight(args as Parameters<typeof convertVolumeToWeight>[0]);
    case "convert_weight_to_volume":
      return convertWeightToVolume(args as Parameters<typeof convertWeightToVolume>[0]);
    case "validate_output":
      return validateOutput((args as { recipe: unknown }).recipe);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

function extractJSONFromContent(content: string): unknown {
  // Try to find a JSON code block first
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return JSON.parse(codeBlockMatch[1].trim());
  }
  // Fall back to parsing the whole content
  return JSON.parse(content);
}

export interface RunAgentOptions {
  recipeText: string;
  sourceUrl?: string;
  onProgress?: (step: string) => void;
}

export async function runRecipeAgent(options: RunAgentOptions): Promise<RecipeJSON> {
  const { recipeText, sourceUrl, onProgress } = options;
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("VITE_OPENAI_API_KEY is not set.");
  }

  const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  const messages = buildInitialMessages(recipeText, sourceUrl);
  const openAITools = toOpenAITools(toolDefinitions.filter((t) => t.name !== "validate_output"));

  let iterations = 0;

  while (iterations < MAX_ITERATIONS) {
    iterations++;
    onProgress?.(`[iter ${iterations}] Calling model...`);

    const response = await client.chat.completions.create({
      model: "gpt-5-nano",
      messages,
      tools: openAITools,
      tool_choice: "auto",
    });

    const choice = response.choices[0];

    if (!choice) throw new Error("No response from model.");

    const message = choice.message;
    messages.push(message);

    if (choice.finish_reason === "tool_calls" && message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments) as unknown;
        const argsPreview = JSON.stringify(args).slice(0, 80);
        onProgress?.(`[iter ${iterations}] Tool: ${toolCall.function.name} — ${argsPreview}`);
        const result = dispatchTool(toolCall.function.name, args);
        const resultPreview = JSON.stringify(result).slice(0, 80);
        onProgress?.(`[iter ${iterations}] ✓ ${toolCall.function.name} → ${resultPreview}`);
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
      continue;
    }

    if (choice.finish_reason === "stop" && message.content) {
      const contentPreview = message.content.slice(0, 200);
      onProgress?.(`[iter ${iterations}] Model stopped. Preview: ${contentPreview}`);
      onProgress?.(`[iter ${iterations}] Parsing final recipe JSON...`);
      const raw = extractJSONFromContent(message.content);

      // Inject required fields the model may not have set
      const withDefaults = {
        ...(raw as object),
        id: randomUUID(),
        extractedAt: new Date().toISOString(),
        metadata: {
          ...((raw as RecipeJSON).metadata ?? {}),
          rawText: recipeText,
        },
      };

      return parseRecipeJSON(withDefaults);
    }

    onProgress?.(`[iter ${iterations}] Unexpected finish_reason: ${choice.finish_reason}`);
    throw new Error(`Unexpected finish_reason: ${choice.finish_reason}`);
  }

  throw new Error(`Agent did not complete within ${MAX_ITERATIONS} iterations.`);
}
