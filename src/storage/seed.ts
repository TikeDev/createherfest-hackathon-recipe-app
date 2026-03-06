import { getAllRecipes, saveRecipe } from './recipes'
import type { RecipeJSON } from '@/types/recipe'

const DEMO_RECIPES: RecipeJSON[] = [
  {
    id: 'demo-bolivia-sopa-de-mani',
    title: 'Sopa de Maní (Bolivian Peanut Soup)',
    sourceDomain: 'demo',
    extractedAt: '2026-03-01T10:00:00.000Z',
    preamble: {
      raw: 'A deeply comforting Bolivian staple. The peanuts give the broth a rich, velvety body. Blend them smooth for the creamiest result.',
      tips: [
        'Use roasted unsalted peanuts for the best flavour.',
        'Blend the peanuts with a little broth first to avoid lumps.',
        'This soup thickens as it sits — add a splash of broth when reheating.',
      ],
      substitutions: [
        {
          original: 'chicken thighs',
          substitute: 'firm tofu or cooked chickpeas',
          note: 'Add at step 6 with the peanuts instead of step 5.',
          sourceNote: 'preamble',
        },
      ],
      techniqueNotes: ['Blending the peanuts while warm gives a smoother result than blending cold.'],
    },
    ingredients: [
      {
        id: 'ing-sm-1', raw: '2 tablespoons vegetable oil', name: 'vegetable oil',
        quantity: 2, unit: 'tablespoon',
        units: [{ original: '2 tablespoons', confidenceLevel: 'high' }],
      },
      {
        id: 'ing-sm-2', raw: '1 medium onion, finely chopped', name: 'onion',
        quantity: 1, unit: null,
        units: [{ original: '1 medium', grams: 150, confidenceLevel: 'high' }],
      },
      {
        id: 'ing-sm-3', raw: '3 cloves garlic, minced', name: 'garlic',
        quantity: 3, unit: 'clove',
        units: [{ original: '3 cloves', confidenceLevel: 'high' }],
      },
      {
        id: 'ing-sm-4', raw: '1 teaspoon ground cumin', name: 'ground cumin',
        quantity: 1, unit: 'teaspoon',
        units: [{ original: '1 teaspoon', grams: 2, confidenceLevel: 'high' }],
      },
      {
        id: 'ing-sm-5', raw: '1 cup roasted unsalted peanuts, blended smooth', name: 'roasted peanuts',
        quantity: 1, unit: 'cup',
        units: [{ original: '1 cup', grams: 145, confidenceLevel: 'high' }],
        substitutions: [
          {
            original: 'roasted peanuts',
            substitute: 'natural peanut butter (no sugar)',
            note: 'Use ½ cup and skip blending.',
            sourceNote: 'inline',
          },
        ],
      },
      {
        id: 'ing-sm-6', raw: '4 cups chicken broth', name: 'chicken broth',
        quantity: 4, unit: 'cup',
        units: [{ original: '4 cups', mlEquivalent: 950, confidenceLevel: 'high' }],
      },
      {
        id: 'ing-sm-7', raw: '2 medium potatoes, peeled and diced', name: 'potatoes',
        quantity: 2, unit: null,
        units: [{ original: '2 medium', grams: 300, confidenceLevel: 'high' }],
      },
      {
        id: 'ing-sm-8', raw: '450g chicken thighs, cut into bite-sized pieces', name: 'chicken thighs',
        quantity: 450, unit: 'g',
        units: [{ original: '450g', grams: 450, confidenceLevel: 'high' }],
      },
      {
        id: 'ing-sm-9', raw: 'Salt and pepper to taste', name: 'salt and pepper',
        quantity: null, unit: null,
        units: [{ original: 'to taste', confidenceLevel: 'high' }],
      },
      {
        id: 'ing-sm-10', raw: 'Fresh parsley, to garnish', name: 'fresh parsley',
        quantity: null, unit: null,
        units: [{ original: 'to garnish', confidenceLevel: 'high' }],
      },
    ],
    steps: [
      {
        id: 'step-sm-1', index: 1,
        text: 'Heat the oil in a large pot over medium heat.',
        isCritical: false, annotations: [],
      },
      {
        id: 'step-sm-2', index: 2,
        text: 'Add the onion and cook, stirring occasionally, until soft and translucent — about 5 minutes.',
        timingMinutes: 5, isCritical: false, annotations: [],
      },
      {
        id: 'step-sm-3', index: 3,
        text: 'Add the garlic and cumin. Stir for 1 minute until fragrant.',
        timingMinutes: 1, isCritical: false,
        annotations: [{ type: 'tip', text: 'Keep the heat at medium — garlic burns quickly and turns bitter.' }],
      },
      {
        id: 'step-sm-4', index: 4,
        text: 'Pour in the chicken broth and bring to a boil.',
        timingMinutes: 5, isCritical: false, annotations: [],
      },
      {
        id: 'step-sm-5', index: 5,
        text: 'Add the potatoes and chicken. Cook for 20 minutes until the chicken is fully cooked through with no pink remaining.',
        timingMinutes: 20, isCritical: true,
        criticalNote: 'Chicken must reach 75°C / 165°F internally before moving on.',
        annotations: [],
      },
      {
        id: 'step-sm-6', index: 6,
        text: 'Stir in the blended peanuts. Reduce to a gentle simmer and cook for 10 minutes, stirring occasionally, until the soup thickens.',
        timingMinutes: 10, isCritical: false,
        annotations: [{ type: 'technique', text: 'Simmer, not boil — a hard boil can make the peanut base separate.' }],
      },
      {
        id: 'step-sm-7', index: 7,
        text: 'Season with salt and pepper. Serve hot, garnished with fresh parsley.',
        isCritical: false, annotations: [],
      },
    ],
    metadata: {
      totalTimeMinutes: 45,
      prepTimeMinutes: 15,
      cookTimeMinutes: 30,
      servings: '4',
    },
  },

  {
    id: 'demo-india-dal-tadka',
    title: 'Dal Tadka (Indian Yellow Lentil Soup)',
    sourceDomain: 'demo',
    extractedAt: '2026-03-02T10:00:00.000Z',
    preamble: {
      raw: 'Dal tadka is one of the most loved comfort foods across India. The "tadka" is a hot spiced oil poured over cooked lentils at the end — it blooms the spices and is the secret to the dish\'s depth.',
      tips: [
        'Rinse the lentils until the water runs clear — this removes excess starch.',
        'The tadka should be added right before serving so the spices stay fragrant.',
        'Leftovers keep well — the flavour deepens overnight.',
      ],
      substitutions: [],
      techniqueNotes: [
        'Tempering (tadka) means briefly frying whole spices in hot fat to release their essential oils. The sizzle is the cue.',
      ],
    },
    ingredients: [
      {
        id: 'ing-dt-1', raw: '1 cup yellow lentils (toor dal or moong dal), rinsed', name: 'yellow lentils',
        quantity: 1, unit: 'cup',
        units: [{ original: '1 cup', grams: 200, confidenceLevel: 'high' }],
      },
      {
        id: 'ing-dt-2', raw: '3 cups water', name: 'water',
        quantity: 3, unit: 'cup',
        units: [{ original: '3 cups', mlEquivalent: 720, confidenceLevel: 'high' }],
      },
      {
        id: 'ing-dt-3', raw: '½ teaspoon turmeric', name: 'turmeric',
        quantity: 0.5, unit: 'teaspoon',
        units: [{ original: '½ teaspoon', grams: 1, confidenceLevel: 'high' }],
      },
      {
        id: 'ing-dt-4', raw: '2 tablespoons ghee or neutral oil', name: 'ghee',
        quantity: 2, unit: 'tablespoon',
        units: [{ original: '2 tablespoons', grams: 28, confidenceLevel: 'high' }],
        substitutions: [
          {
            original: 'ghee',
            substitute: 'neutral oil (canola, sunflower)',
            note: 'Works well — slightly less rich.',
            sourceNote: 'inline',
          },
        ],
      },
      {
        id: 'ing-dt-5', raw: '1 teaspoon cumin seeds', name: 'cumin seeds',
        quantity: 1, unit: 'teaspoon',
        units: [{ original: '1 teaspoon', grams: 2, confidenceLevel: 'high' }],
      },
      {
        id: 'ing-dt-6', raw: '1 medium onion, finely chopped', name: 'onion',
        quantity: 1, unit: null,
        units: [{ original: '1 medium', grams: 150, confidenceLevel: 'high' }],
      },
      {
        id: 'ing-dt-7', raw: '3 cloves garlic, minced', name: 'garlic',
        quantity: 3, unit: 'clove',
        units: [{ original: '3 cloves', confidenceLevel: 'high' }],
      },
      {
        id: 'ing-dt-8', raw: '1-inch piece fresh ginger, grated', name: 'fresh ginger',
        quantity: 1, unit: 'inch',
        units: [{ original: '1-inch piece', grams: 8, confidenceLevel: 'medium', explanation: '1-inch piece of ginger ≈ 8g' }],
      },
      {
        id: 'ing-dt-9', raw: '2 medium tomatoes, chopped', name: 'tomatoes',
        quantity: 2, unit: null,
        units: [{ original: '2 medium', grams: 250, confidenceLevel: 'high' }],
      },
      {
        id: 'ing-dt-10', raw: '1 teaspoon ground coriander', name: 'ground coriander',
        quantity: 1, unit: 'teaspoon',
        units: [{ original: '1 teaspoon', grams: 2, confidenceLevel: 'high' }],
      },
      {
        id: 'ing-dt-11', raw: '½ teaspoon red chili powder (or to taste)', name: 'red chili powder',
        quantity: 0.5, unit: 'teaspoon',
        units: [{ original: '½ teaspoon', confidenceLevel: 'high' }],
      },
      {
        id: 'ing-dt-12', raw: 'Salt to taste', name: 'salt',
        quantity: null, unit: null,
        units: [{ original: 'to taste', confidenceLevel: 'high' }],
      },
      {
        id: 'ing-dt-13', raw: 'Fresh cilantro, to garnish', name: 'fresh cilantro',
        quantity: null, unit: null,
        units: [{ original: 'to garnish', confidenceLevel: 'high' }],
      },
      {
        id: 'ing-dt-14', raw: '1 lemon, cut into wedges for serving', name: 'lemon',
        quantity: 1, unit: null,
        units: [{ original: '1 lemon', confidenceLevel: 'high' }],
      },
    ],
    steps: [
      {
        id: 'step-dt-1', index: 1,
        text: 'Rinse the lentils under cold water until the water runs clear.',
        isCritical: false,
        annotations: [{ type: 'tip', text: 'Rinsing removes surface starch that causes foaming during cooking.' }],
      },
      {
        id: 'step-dt-2', index: 2,
        text: 'Combine the lentils, water, and turmeric in a medium pot. Bring to a boil over high heat.',
        timingMinutes: 5, isCritical: false, annotations: [],
      },
      {
        id: 'step-dt-3', index: 3,
        text: 'Reduce to a low simmer. Cover and cook for 25 minutes, stirring occasionally, until the lentils are completely soft and starting to break down.',
        timingMinutes: 25, isCritical: true,
        criticalNote: 'Lentils must be fully soft — undercooked lentils are hard to digest.',
        annotations: [],
      },
      {
        id: 'step-dt-4', index: 4,
        text: 'In a separate pan, heat the ghee over medium-high heat. Add the cumin seeds — they should sizzle immediately in the hot fat.',
        timingMinutes: 1, isCritical: false,
        annotations: [{ type: 'technique', text: 'This is the tadka (tempering). The sizzle means the fat is hot enough to bloom the spice. If there\'s no sizzle, wait another 30 seconds.' }],
      },
      {
        id: 'step-dt-5', index: 5,
        text: 'Add the onion and cook, stirring, until golden — about 8 minutes.',
        timingMinutes: 8, isCritical: false, annotations: [],
      },
      {
        id: 'step-dt-6', index: 6,
        text: 'Add the garlic and ginger. Cook for 2 minutes until fragrant.',
        timingMinutes: 2, isCritical: false, annotations: [],
      },
      {
        id: 'step-dt-7', index: 7,
        text: 'Add the tomatoes, coriander, and chili powder. Cook until the tomatoes break down and the mixture looks jammy — about 5 minutes.',
        timingMinutes: 5, isCritical: false, annotations: [],
      },
      {
        id: 'step-dt-8', index: 8,
        text: 'Pour the tadka over the cooked lentils. Stir everything together well.',
        isCritical: false,
        annotations: [{ type: 'tip', text: 'Do this right before serving — the spices are most fragrant when fresh.' }],
      },
      {
        id: 'step-dt-9', index: 9,
        text: 'Season with salt. Serve topped with fresh cilantro and a wedge of lemon on the side.',
        isCritical: false, annotations: [],
      },
    ],
    metadata: {
      totalTimeMinutes: 40,
      prepTimeMinutes: 10,
      cookTimeMinutes: 30,
      servings: '4',
    },
  },

  {
    id: 'demo-portugal-caldo-verde',
    title: 'Caldo Verde (Portuguese Green Soup)',
    sourceDomain: 'demo',
    extractedAt: '2026-03-03T10:00:00.000Z',
    preamble: {
      raw: 'Caldo verde is Portugal\'s most beloved soup — simple, warming, and made from almost nothing. The key is slicing the kale paper-thin and adding it at the very end so it stays vivid green.',
      tips: [
        'Slice the kale as finely as you can — almost like a chiffonade. Thick pieces turn chewy.',
        'Don\'t overcook the kale. Two to three minutes is all it needs.',
        'A drizzle of good olive oil at the end makes a big difference.',
      ],
      substitutions: [
        {
          original: 'chouriço',
          substitute: 'smoked paprika sausage or Spanish chorizo',
          note: 'Adds similar smoky depth.',
          sourceNote: 'preamble',
        },
      ],
      techniqueNotes: ['Mashing the potatoes in the broth (rather than separately) is what gives caldo verde its characteristic silky-thick texture.'],
    },
    ingredients: [
      {
        id: 'ing-cv-1', raw: '2 tablespoons olive oil, plus more to serve', name: 'olive oil',
        quantity: 2, unit: 'tablespoon',
        units: [{ original: '2 tablespoons', mlEquivalent: 30, confidenceLevel: 'high' }],
      },
      {
        id: 'ing-cv-2', raw: '1 medium onion, thinly sliced', name: 'onion',
        quantity: 1, unit: null,
        units: [{ original: '1 medium', grams: 150, confidenceLevel: 'high' }],
      },
      {
        id: 'ing-cv-3', raw: '3 cloves garlic, sliced', name: 'garlic',
        quantity: 3, unit: 'clove',
        units: [{ original: '3 cloves', confidenceLevel: 'high' }],
      },
      {
        id: 'ing-cv-4', raw: '4 medium potatoes, peeled and roughly sliced', name: 'potatoes',
        quantity: 4, unit: null,
        units: [{ original: '4 medium', grams: 600, confidenceLevel: 'high' }],
      },
      {
        id: 'ing-cv-5', raw: '5 cups chicken or vegetable broth', name: 'broth',
        quantity: 5, unit: 'cup',
        units: [{ original: '5 cups', mlEquivalent: 1200, confidenceLevel: 'high' }],
      },
      {
        id: 'ing-cv-6', raw: '200g kale or collard greens, very finely shredded', name: 'kale',
        quantity: 200, unit: 'g',
        units: [{ original: '200g', grams: 200, confidenceLevel: 'high' }],
        substitutions: [
          {
            original: 'kale',
            substitute: 'spring greens or savoy cabbage',
            note: 'Shred as finely as possible.',
            sourceNote: 'inline',
          },
        ],
      },
      {
        id: 'ing-cv-7', raw: '150g chouriço, thinly sliced (optional)', name: 'chouriço',
        quantity: 150, unit: 'g',
        units: [{ original: '150g', grams: 150, confidenceLevel: 'high' }],
      },
      {
        id: 'ing-cv-8', raw: 'Salt and black pepper to taste', name: 'salt and pepper',
        quantity: null, unit: null,
        units: [{ original: 'to taste', confidenceLevel: 'high' }],
      },
    ],
    steps: [
      {
        id: 'step-cv-1', index: 1,
        text: 'Heat the olive oil in a large pot over medium heat. Add the onion and garlic and cook, stirring, until soft — about 5 minutes.',
        timingMinutes: 5, isCritical: false, annotations: [],
      },
      {
        id: 'step-cv-2', index: 2,
        text: 'Add the potatoes and broth. Bring to a boil.',
        timingMinutes: 5, isCritical: false, annotations: [],
      },
      {
        id: 'step-cv-3', index: 3,
        text: 'Reduce heat and cook until the potatoes are completely tender and falling apart — about 15 minutes.',
        timingMinutes: 15, isCritical: false,
        annotations: [{ type: 'tip', text: 'The potatoes should be very soft — almost disintegrating. This is what makes the soup thick.' }],
      },
      {
        id: 'step-cv-4', index: 4,
        text: 'Use a potato masher or immersion blender to mash or blend the soup until smooth and creamy.',
        isCritical: false,
        annotations: [{ type: 'technique', text: 'For a rustic texture, mash roughly with a fork. For a silky soup, use an immersion blender directly in the pot.' }],
      },
      {
        id: 'step-cv-5', index: 5,
        text: 'Add the shredded kale and chouriço. Cook for 3 minutes — keep the heat gentle so the kale stays bright green.',
        timingMinutes: 3, isCritical: true,
        criticalNote: 'Do not cook longer than 3–4 minutes or the kale turns dull and bitter.',
        annotations: [],
      },
      {
        id: 'step-cv-6', index: 6,
        text: 'Season with salt and pepper. Serve in bowls with a drizzle of olive oil.',
        isCritical: false, annotations: [],
      },
    ],
    metadata: {
      totalTimeMinutes: 35,
      prepTimeMinutes: 10,
      cookTimeMinutes: 25,
      servings: '4–6',
    },
  },
]

const SEED_IDS = new Set(DEMO_RECIPES.map((r) => r.id))

export async function seedDemoRecipes(): Promise<void> {
  const existing = await getAllRecipes()
  const existingIds = new Set(existing.map((r) => r.id))
  const missing = DEMO_RECIPES.filter((r) => !existingIds.has(r.id))

  if (missing.length === 0) return

  await Promise.all(missing.map(saveRecipe))
}

// Exported so tests or devtools can check seeded state
export { SEED_IDS }
