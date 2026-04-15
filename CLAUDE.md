# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

## Architecture

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS · SQLite (better-sqlite3)

**Data flow:**
- `src/app/page.tsx` — async Server Component that fetches todos via `getTodos()` and passes them to `<TodoApp>`
- `src/app/actions.ts` — all Server Actions (add, toggle, delete, updatePriority, clearCompleted); each calls `revalidatePath("/")` after mutation
- `src/lib/db.ts` — singleton SQLite connection; auto-creates `data/todos.db` and the `todos` table on first use
- `src/components/TodoApp.tsx` — single client component holding all UI + filter state; uses optimistic updates (local `useState` mutation inside `startTransition`) so the UI responds instantly before the server action completes

**Database:** SQLite file at `data/todos.db` (gitignored). Schema: `id`, `text`, `completed` (INTEGER 0/1), `priority` (low/medium/high TEXT), `created_at` (TEXT datetime).

**No API routes** — all mutations go through Server Actions only.
