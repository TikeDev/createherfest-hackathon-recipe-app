import OpenAI from 'openai'
import { randomUUID } from '@/lib/uuid'
import { toolDefinitions, toOpenAITools } from './toolDefinitions'
import { extractPreamble } from './tools/extractPreamble'
import { parseIngredients } from './tools/parseIngredients'
import { extractSteps } from './tools/extractSteps'
import { convertVolumeToWeight } from './tools/convertVolumeToWeight'
import { convertWeightToVolume } from './tools/convertWeightToVolume'
import { validateOutput, parseRecipeJSON } from './tools/validateOutput'
import type { RecipeJSON } from '@/types/recipe'

const MAX_ITERATIONS = 30

const SYSTEM_PROMPT = `You are a recipe extraction assistant. Your job is to parse recipe text into a structured JSON format using the tools provided.

Follow this sequence:
1. Call extract_preamble with the intro/preamble text to get tips, substitutions, and technique notes.
2. Call parse_ingredients with the ingredient list section.
3. Call extract_steps with the cooking instructions section.
4. For each ingredient that has a volume measurement, call convert_volume_to_weight to add gram equivalents.
5. For each ingredient that has a weight measurement, call convert_weight_to_volume to add volume equivalents for users without a scale.
6. Output the final RecipeJSON as a JSON code block. Do not call any more tools after step 5 is done.

Rules you must follow:
- NEVER fabricate ingredient substitutions. Only include substitutions explicitly stated in the source text.
- Flag uncertainty on conversions rather than guessing. Use the conversion tools as provided.
- Preserve the author's preamble intent — do not paraphrase tips.
- If a step requires overnight marinating, extended resting, or any timing that cannot be shortened, mark it as critical.
- Output the final result as a single JSON code block containing the complete RecipeJSON object.
- Do NOT include "id" or "extractedAt" fields in your output — they will be injected automatically.`

function buildInitialMessages(
  recipeText: string,
  sourceUrl?: string,
): OpenAI.Chat.ChatCompletionMessageParam[] {
  const urlNote = sourceUrl ? `\nSource URL: ${sourceUrl}` : ''
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Please extract this recipe into structured JSON.${urlNote}\n\n---\n\n${recipeText}`,
    },
  ]
}

function dispatchTool(name: string, args: unknown): unknown {
  switch (name) {
    case 'extract_preamble':
      return extractPreamble(args as Parameters<typeof extractPreamble>[0])
    case 'parse_ingredients':
      return parseIngredients(args as Parameters<typeof parseIngredients>[0])
    case 'extract_steps':
      return extractSteps(args as Parameters<typeof extractSteps>[0])
    case 'convert_volume_to_weight':
      return convertVolumeToWeight(args as Parameters<typeof convertVolumeToWeight>[0])
    case 'convert_weight_to_volume':
      return convertWeightToVolume(args as Parameters<typeof convertWeightToVolume>[0])
    case 'validate_output':
      return validateOutput((args as { recipe: unknown }).recipe)
    default:
      return { error: `Unknown tool: ${name}` }
  }
}

function extractJSONFromContent(content: string): unknown {
  // Try to find a JSON code block first
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    return JSON.parse(codeBlockMatch[1].trim())
  }
  // Fall back to parsing the whole content
  return JSON.parse(content)
}

export interface RunAgentOptions {
  recipeText: string
  sourceUrl?: string
  onProgress?: (step: string) => void
}

export async function runRecipeAgent(options: RunAgentOptions): Promise<RecipeJSON> {
  const { recipeText, sourceUrl, onProgress } = options
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string

  if (!apiKey) {
    throw new Error('VITE_OPENAI_API_KEY is not set.')
  }

  const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })
  const messages = buildInitialMessages(recipeText, sourceUrl)
  const openAITools = toOpenAITools(toolDefinitions.filter((t) => t.name !== 'validate_output'))

  let iterations = 0

  while (iterations < MAX_ITERATIONS) {
    iterations++
    onProgress?.(`Calling model (iteration ${iterations})...`)

    const response = await client.chat.completions.create({
      model: 'gpt-5-nano',
      temperature: 0.3,
      messages,
      tools: openAITools,
      tool_choice: 'auto',
    })

    const choice = response.choices[0]

    if (!choice) throw new Error('No response from model.')

    const message = choice.message
    messages.push(message)

    if (choice.finish_reason === 'tool_calls' && message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments) as unknown
        onProgress?.(`Running tool: ${toolCall.function.name}`)
        const result = dispatchTool(toolCall.function.name, args)
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        })
      }
      continue
    }

    if (choice.finish_reason === 'stop' && message.content) {
      onProgress?.('Parsing final recipe JSON...')
      const raw = extractJSONFromContent(message.content)

      // Inject required fields the model may not have set
      const withDefaults = {
        ...(raw as object),
        id: randomUUID(),
        extractedAt: new Date().toISOString(),
        metadata: {
          ...((raw as RecipeJSON).metadata ?? {}),
          rawText: recipeText,
        },
      }

      return parseRecipeJSON(withDefaults)
    }

    throw new Error(`Unexpected finish_reason: ${choice.finish_reason}`)
  }

  throw new Error(`Agent did not complete within ${MAX_ITERATIONS} iterations.`)
}
