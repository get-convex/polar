import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UpgradeCTA } from "./UpgradeCta";
import { AlertCircle } from "lucide-react";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [isPremium, setIsPremium] = useState(false); // This would typically be set based on user's subscription status

  const MAX_FREE_TODOS = 5;

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      if (!isPremium && todos.length >= MAX_FREE_TODOS) {
        alert(
          "You've reached the maximum number of todos for the free plan. Please upgrade to add more!"
        );
        return;
      }
      setTodos([
        ...todos,
        { id: Date.now(), text: newTodo.trim(), completed: false },
      ]);
      setNewTodo("");
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-950 py-10 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4">
        <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-950 border border-transparent dark:border-gray-900 rounded-lg shadow-lg dark:shadow-gray-800/30">
          <h1 className="text-3xl font-light mb-6 text-gray-800 dark:text-gray-100">
            Todo List
          </h1>
          <form onSubmit={addTodo} className="mb-6">
            <Input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task"
              className="w-full text-lg py-2 border-b border-gray-300 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 transition-colors duration-300 bg-transparent dark:text-gray-100 dark:placeholder-gray-400"
            />
          </form>
          {!isPremium && todos.length >= MAX_FREE_TODOS && (
            <div className="flex items-center text-yellow-600 dark:text-yellow-400 mb-4">
              <AlertCircle className="mr-2" />
              <span>
                You've reached the limit for free todos. Upgrade to add more!
              </span>
            </div>
          )}
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800"
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`text-lg flex-grow text-left ${
                    todo.completed
                      ? "line-through text-gray-400 dark:text-gray-500"
                      : "text-gray-800 dark:text-gray-100"
                  }`}
                >
                  {todo.text}
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTodo(todo.id)}
                  className="text-gray-400 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
          {!isPremium && <UpgradeCTA />}
        </div>
      </div>
    </main>
  );
}
