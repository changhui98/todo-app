"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import type { Priority, Todo } from "@/lib/types";

export async function getTodos(): Promise<Todo[]> {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT id, text, completed, priority, created_at FROM todos ORDER BY created_at DESC"
    )
    .all() as Array<{
    id: number;
    text: string;
    completed: number;
    priority: string;
    created_at: string;
  }>;
  return rows.map((r) => ({ ...r, completed: r.completed === 1, priority: r.priority as Priority }));
}

export async function addTodo(text: string, priority: Priority): Promise<void> {
  if (!text.trim()) return;
  const db = getDb();
  db.prepare("INSERT INTO todos (text, priority) VALUES (?, ?)").run(text.trim(), priority);
  revalidatePath("/");
}

export async function toggleTodo(id: number): Promise<void> {
  const db = getDb();
  db.prepare("UPDATE todos SET completed = NOT completed WHERE id = ?").run(id);
  revalidatePath("/");
}

export async function deleteTodo(id: number): Promise<void> {
  const db = getDb();
  db.prepare("DELETE FROM todos WHERE id = ?").run(id);
  revalidatePath("/");
}

export async function updateTodoPriority(id: number, priority: Priority): Promise<void> {
  const db = getDb();
  db.prepare("UPDATE todos SET priority = ? WHERE id = ?").run(priority, id);
  revalidatePath("/");
}

export async function clearCompleted(): Promise<void> {
  const db = getDb();
  db.prepare("DELETE FROM todos WHERE completed = 1").run();
  revalidatePath("/");
}
