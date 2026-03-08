import OpenAI from 'openai'
import type { Ingredient, GroceryCategory } from '@/types/recipe'

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
})

const CATEGORIES: GroceryCategory[] = [
  'Produce', 'Protein', 'Dairy', 'Pantry', 'Spices & Seasonings',
  'Oils & Vinegars', 'Canned & Jarred', 'Frozen', 'Bakery', 'Beverages', 'Other',
]

const SYSTEM_PROMPT = `You are a grocery categorization assistant. Given a numbered list of ingredients, assign each one a category.

Categories: ${CATEGORIES.join(', ')}

Rules:
- Produce: fresh fruits, vegetables, herbs
- Protein: meat, fish, seafood, eggs, tofu, legumes (dried beans/lentils)
- Dairy: milk, cream, butter, cheese, yogurt
- Pantry: flour, sugar, rice, pasta, oats, breadcrumbs, baking powder, cornstarch
- Spices & Seasonings: salt, pepper, spices, dried herbs, seasoning blends
- Oils & Vinegars: cooking oils, vinegars, cooking wines
- Canned & Jarred: canned tomatoes, canned beans, broths, jarred sauces, canned fish
- Frozen: frozen vegetables, frozen protein
- Bakery: bread, tortillas, pita, rolls
- Beverages: juice, wine, beer, stock, broth in carton
- Other: anything that doesn't fit above

Respond with ONLY a JSON object like this — numeric index as key, category as value:
{"0":"Produce","1":"Dairy","2":"Pantry"}`

export async function classifyGroceries(
  ingredients: Ingredient[],
): Promise<Record<string, GroceryCategory>> {
  if (ingredients.length === 0) return {}

  // Use numeric indices as keys — the LLM handles these reliably
  const ingredientList = ingredients
    .map((ing, i) => `${i}: ${ing.name}`)
    .join('\n')

  const response = await client.chat.completions.create({
    model: 'gpt-5-nano',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: ingredientList },
    ],
  })

  const raw = response.choices[0]?.message?.content ?? '{}'

  // Strip markdown code fences if the model wraps the response
  const cleaned = raw.replace(/```(?:json)?\n?/g, '').trim()
  const parsed = JSON.parse(cleaned) as Record<string, string>

  // Map index → ingredient id, validate each category
  return Object.fromEntries(
    ingredients.map((ing, i) => [
      ing.id,
      (CATEGORIES.includes(parsed[String(i)] as GroceryCategory)
        ? parsed[String(i)]
        : 'Other') as GroceryCategory,
    ]),
  )
}
