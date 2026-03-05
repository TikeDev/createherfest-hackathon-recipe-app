export interface ScrapedRecipe {
  title: string
  ingredients: string[]
  instructions_list: string[]
  yields: string
  total_time: number | null
  prep_time: number | null
  cook_time: number | null
  image: string
  host: string
  language: string
  description: string
}

export interface FetchedRecipe {
  scrapedRecipe: ScrapedRecipe
  title: string
  sourceDomain: string
}

/**
 * Fetches and parses a recipe URL via the Python scraper Vercel function.
 * Returns structured JSON from recipe-scrapers instead of raw HTML text.
 */
export async function fetchRecipeFromUrl(url: string): Promise<FetchedRecipe> {
  const apiBase = import.meta.env.VITE_API_BASE ?? ''
  const response = await fetch(`${apiBase}/api/scrape-recipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })

  const data = (await response.json()) as ScrapedRecipe | { error: string }

  if (!response.ok) {
    throw new Error((data as { error: string }).error ?? `Scraper error: ${response.status}`)
  }

  const scraped = data as ScrapedRecipe
  const sourceDomain = new URL(url).hostname.replace(/^www\./, '')
  const title = scraped.title || sourceDomain

  return { scrapedRecipe: scraped, title, sourceDomain }
}
