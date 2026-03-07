import { getDB } from "./db";
import type { QueueEntry } from "@/types/queue";

export async function enqueue(entry: QueueEntry): Promise<void> {
  const db = await getDB();
  await db.put("queue", entry);
}

export async function updateQueueEntry(id: string, updates: Partial<QueueEntry>): Promise<void> {
  const db = await getDB();
  const existing = (await db.get("queue", id)) as QueueEntry | undefined;
  if (!existing) return;
  await db.put("queue", { ...existing, ...updates } as QueueEntry);
}

export async function getPendingEntries(): Promise<QueueEntry[]> {
  const db = await getDB();
  const entries = (await db.getAll("queue")) as QueueEntry[];
  return entries.filter((e): e is QueueEntry => e.status === "pending");
}

export async function getQueueEntry(id: string): Promise<QueueEntry | undefined> {
  const db = await getDB();
  const entry = (await db.get("queue", id)) as QueueEntry | undefined;
  return entry;
}
