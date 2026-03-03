import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { RecipeJSON } from '@/types/recipe'
import type { QueueEntry } from '@/types/queue'

interface RecipeDB extends DBSchema {
  recipes: {
    key: string
    value: RecipeJSON
    indexes: { by_date: string }
  }
  queue: {
    key: string
    value: QueueEntry
    indexes: { by_status: string }
  }
}

const DB_NAME = 'simmer'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<RecipeDB>> | null = null

export function getDB(): Promise<IDBPDatabase<RecipeDB>> {
  if (!dbPromise) {
    dbPromise = openDB<RecipeDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const recipeStore = db.createObjectStore('recipes', { keyPath: 'id' })
        recipeStore.createIndex('by_date', 'extractedAt')

        const queueStore = db.createObjectStore('queue', { keyPath: 'id' })
        queueStore.createIndex('by_status', 'status')
      },
    })
  }
  return dbPromise
}
