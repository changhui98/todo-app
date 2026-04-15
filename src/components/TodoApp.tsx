"use client";

import { useState, useTransition } from "react";
import type { Todo, Filter, Priority } from "@/lib/types";
import {
  addTodo,
  toggleTodo,
  deleteTodo,
  clearCompleted,
  updateTodoPriority,
} from "@/app/actions";

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; dot: string; badge: string }
> = {
  high: {
    label: "높음",
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  },
  medium: {
    label: "보통",
    dot: "bg-yellow-400",
    badge:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  },
  low: {
    label: "낮음",
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  },
};

export default function TodoApp({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [filter, setFilter] = useState<Filter>("all");
  const [isPending, startTransition] = useTransition();

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const hasCompleted = todos.some((t) => t.completed);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const optimistic: Todo = {
      id: Date.now(),
      text: input.trim(),
      completed: false,
      priority,
      created_at: new Date().toISOString(),
    };
    setTodos((prev) => [optimistic, ...prev]);
    const text = input.trim();
    setInput("");
    startTransition(async () => {
      await addTodo(text, priority);
      // Server will revalidate; for now optimistic state is good
    });
  }

  function handleToggle(id: number) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    startTransition(() => toggleTodo(id));
  }

  function handleDelete(id: number) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    startTransition(() => deleteTodo(id));
  }

  function handleClearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.completed));
    startTransition(() => clearCompleted());
  }

  function handlePriorityChange(id: number, p: Priority) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, priority: p } : t))
    );
    startTransition(() => updateTodoPriority(id, p));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <h1 className="text-4xl font-bold text-white text-center mb-8 tracking-tight">
          할 일 목록
        </h1>

        {/* Input Form */}
        <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <div className="flex flex-1 items-center bg-white/10 backdrop-blur border border-white/20 rounded-xl px-4 gap-2 focus-within:border-purple-400 transition-colors">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="bg-transparent text-sm text-white/80 py-3 focus:outline-none cursor-pointer"
              aria-label="우선순위 선택"
            >
              <option value="high" className="bg-slate-800">
                🔴 높음
              </option>
              <option value="medium" className="bg-slate-800">
                🟡 보통
              </option>
              <option value="low" className="bg-slate-800">
                🟢 낮음
              </option>
            </select>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="새 할 일을 입력하세요..."
              className="flex-1 bg-transparent text-white placeholder-white/40 py-3 focus:outline-none text-sm"
              maxLength={200}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isPending}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-5 rounded-xl transition-colors text-sm"
          >
            추가
          </button>
        </form>

        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
            {(["all", "active", "completed"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filter === f
                    ? "bg-purple-600 text-white"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {f === "all" ? "전체" : f === "active" ? "진행 중" : "완료"}
              </button>
            ))}
          </div>
          <span className="text-white/40 text-xs">
            {activeCount}개 남음
          </span>
        </div>

        {/* Todo List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-sm">
              {filter === "completed"
                ? "완료된 항목이 없어요"
                : filter === "active"
                ? "진행 중인 항목이 없어요"
                : "할 일을 추가해 보세요!"}
            </div>
          ) : (
            filtered.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onPriorityChange={handlePriorityChange}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {hasCompleted && (
          <div className="mt-4 text-center">
            <button
              onClick={handleClearCompleted}
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              완료된 항목 모두 삭제
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TodoItem({
  todo,
  onToggle,
  onDelete,
  onPriorityChange,
}: {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onPriorityChange: (id: number, p: Priority) => void;
}) {
  const cfg = PRIORITY_CONFIG[todo.priority];

  return (
    <div
      className={`group flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 transition-all hover:border-white/20 ${
        todo.completed ? "opacity-50" : ""
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(todo.id)}
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          todo.completed
            ? "bg-purple-600 border-purple-600"
            : "border-white/30 hover:border-purple-400"
        }`}
        aria-label={todo.completed ? "완료 취소" : "완료 표시"}
      >
        {todo.completed && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </button>

      {/* Text */}
      <span
        className={`flex-1 text-sm ${
          todo.completed ? "line-through text-white/40" : "text-white/90"
        }`}
      >
        {todo.text}
      </span>

      {/* Priority badge */}
      <select
        value={todo.priority}
        onChange={(e) => onPriorityChange(todo.id, e.target.value as Priority)}
        className={`text-xs font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer focus:outline-none ${cfg.badge} bg-transparent`}
        aria-label="우선순위 변경"
      >
        {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
          <option key={p} value={p} className="bg-slate-800 text-white">
            {PRIORITY_CONFIG[p].label}
          </option>
        ))}
      </select>

      {/* Delete */}
      <button
        onClick={() => onDelete(todo.id)}
        className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all"
        aria-label="삭제"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
