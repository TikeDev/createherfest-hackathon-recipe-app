import type { VercelRequest, VercelResponse } from "@vercel/node";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const FETCH_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

type RecipeLike = Record<string, unknown>;

function setCors(res: VercelResponse): void {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
}

function jsonResponse(res: VercelResponse, status: number, body: Record<string, unknown>): void {
  setCors(res);
  res.status(status).json(body);
}

function parseDurationMinutes(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;

  const iso = value
    .trim()
    .match(/^P(?:\d+Y)?(?:\d+M)?(?:\d+D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/i);
  if (!iso) return null;

  const hours = Number(iso[1] ?? 0);
  const minutes = Number(iso[2] ?? 0);
  const seconds = Number(iso[3] ?? 0);
  return hours * 60 + minutes + Math.floor(seconds / 60);
}

function stripHtmlTags(text: string): string {
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeInstructions(value: unknown): string[] {
  const steps: string[] = [];

  const visit = (node: unknown): void => {
    if (!node) return;

    if (typeof node === "string") {
      const cleaned = stripHtmlTags(node);
      if (cleaned) steps.push(cleaned);
      return;
    }

    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }

    if (typeof node === "object") {
      const obj = node as Record<string, unknown>;
      if (typeof obj.text === "string") {
        const cleaned = stripHtmlTags(obj.text);
        if (cleaned) steps.push(cleaned);
        return;
      }
      if (obj.itemListElement) {
        visit(obj.itemListElement);
      }
    }
  };

  visit(value);
  return steps;
}

function getImageUrl(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    for (const item of value as unknown[]) {
      if (typeof item === "string" || (item && typeof item === "object")) {
        return getImageUrl(item);
      }
    }
    return "";
  }
  if (value && typeof value === "object") {
    const url = (value as Record<string, unknown>).url;
    return typeof url === "string" ? url : "";
  }
  return "";
}

function toObjects(value: unknown): RecipeLike[] {
  if (!value) return [];
  if (Array.isArray(value))
    return value.filter((item): item is RecipeLike => !!item && typeof item === "object");
  if (typeof value === "object") return [value as RecipeLike];
  return [];
}

function isRecipeType(value: unknown): boolean {
  if (typeof value === "string") return value.toLowerCase() === "recipe";
  if (Array.isArray(value))
    return value.some((item) => typeof item === "string" && item.toLowerCase() === "recipe");
  return false;
}

function extractRecipeFromJsonLd(html: string): RecipeLike | null {
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = re.exec(html)) !== null) {
    const raw = match[1]?.trim();
    if (!raw) continue;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }

    const candidates: RecipeLike[] = [];
    toObjects(parsed).forEach((obj) => {
      candidates.push(obj);
      toObjects(obj["@graph"]).forEach((graphItem) => candidates.push(graphItem));
    });

    const recipe = candidates.find((obj) => isRecipeType(obj["@type"]));
    if (recipe) return recipe;
  }

  return null;
}

function parseRequestBody(req: VercelRequest): Record<string, unknown> | null {
  if (req.body && typeof req.body === "object") return req.body as Record<string, unknown>;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method === "OPTIONS") {
    setCors(res);
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    jsonResponse(res, 405, { error: "Method not allowed. Use POST." });
    return;
  }

  const body = parseRequestBody(req);
  if (!body) {
    jsonResponse(res, 400, { error: "Request body must be valid JSON." });
    return;
  }

  const rawUrl = body.url;
  if (typeof rawUrl !== "string" || !rawUrl.trim()) {
    jsonResponse(res, 400, { error: "Missing required field: url" });
    return;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    jsonResponse(res, 400, { error: "Invalid URL." });
    return;
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    jsonResponse(res, 400, { error: "Only http and https URLs are allowed." });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let html: string;
  try {
    const upstream = await fetch(parsedUrl.toString(), {
      headers: FETCH_HEADERS,
      signal: controller.signal,
      redirect: "follow",
    });

    if (!upstream.ok) {
      jsonResponse(res, 502, { error: `Failed to fetch URL: HTTP ${upstream.status}` });
      return;
    }

    html = await upstream.text();
  } catch (error) {
    const isAbort = error instanceof Error && error.name === "AbortError";
    jsonResponse(res, 502, {
      error: isAbort ? "Timed out fetching the recipe page." : "Failed to fetch URL.",
    });
    return;
  } finally {
    clearTimeout(timeout);
  }

  const recipe = extractRecipeFromJsonLd(html);
  if (!recipe) {
    jsonResponse(res, 422, {
      error: "Could not extract a recipe from this page. Try pasting the recipe text directly.",
    });
    return;
  }

  const ingredients = Array.isArray(recipe.recipeIngredient)
    ? recipe.recipeIngredient.filter((item): item is string => typeof item === "string")
    : [];

  const instructionsList = normalizeInstructions(recipe.recipeInstructions);

  const htmlLangMatch = html.match(/<html[^>]*\slang=["']([^"']+)["']/i);
  const language =
    (typeof recipe.inLanguage === "string" && recipe.inLanguage) ||
    (htmlLangMatch ? htmlLangMatch[1] : "");

  const recipeYield =
    typeof recipe.recipeYield === "string"
      ? recipe.recipeYield
      : Array.isArray(recipe.recipeYield)
        ? recipe.recipeYield.filter((item): item is string => typeof item === "string").join(", ")
        : "";

  jsonResponse(res, 200, {
    title: typeof recipe.name === "string" ? recipe.name : "",
    ingredients,
    instructions_list: instructionsList,
    yields: recipeYield,
    total_time: parseDurationMinutes(recipe.totalTime),
    prep_time: parseDurationMinutes(recipe.prepTime),
    cook_time: parseDurationMinutes(recipe.cookTime),
    image: getImageUrl(recipe.image),
    host: parsedUrl.hostname.replace(/^www\./, ""),
    language,
    description: typeof recipe.description === "string" ? recipe.description : "",
  });
}
