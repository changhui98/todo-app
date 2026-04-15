import { getTodos } from "./actions";
import TodoApp from "@/components/TodoApp";

export default async function Home() {
  const todos = await getTodos();
  return <TodoApp initialTodos={todos} />;
}
