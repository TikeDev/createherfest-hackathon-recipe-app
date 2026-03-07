import { getDB } from "./db";
import type { RecipeJSON } from "@/types/recipe";

export async function saveRecipe(recipe: RecipeJSON): Promise<void> {
  const db = await getDB();
  await db.put("recipes", recipe);
}

export async function updateRecipe(recipe: RecipeJSON): Promise<void> {
  const db = await getDB();
  await db.put("recipes", recipe);
}

export async function getRecipe(id: string): Promise<RecipeJSON | undefined> {
  const db = await getDB();
  const recipe = (await db.get("recipes", id)) as RecipeJSON | undefined;
  return recipe;
}

export async function getAllRecipes(): Promise<RecipeJSON[]> {
  const db = await getDB();
  const recipes = await db.getAll("recipes");
  return (recipes as RecipeJSON[]).reverse(); // Most recent first
}

export async function deleteRecipe(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("recipes", id);
}
