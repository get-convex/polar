import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BillingSettings } from "./BillingSettings";
import { AlertCircle } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function TodoList() {
  const user = useQuery(api.example.getCurrentUser);
  const todos = useQuery(api.example.listTodos);
  const insertTodo = useMutation(api.example.insertTodo);
  const completeTodo = useMutation(api.example.completeTodo);
  const deleteTodo = useMutation(api.example.deleteTodo);
  const [newTodo, setNewTodo] = useState("");

  const todosLength = todos?.length ?? 0;
  const isAtMaxTodos = user?.maxTodos && todosLength >= user.maxTodos;

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    const todo = newTodo.trim();
    if (todo) {
      if (isAtMaxTodos) {
        alert(
          "You've reached the maximum number of todos for your current plan. Please upgrade to add more!"
        );
        return;
      }
      insertTodo({ text: todo });
      setNewTodo("");
    }
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
          {isAtMaxTodos && (
            <div className="flex items-center text-yellow-600 dark:text-yellow-400 mb-4">
              <AlertCircle className="mr-2" />
              <span>
                You've reached the limit for your current plan. Upgrade to add
                more!
              </span>
            </div>
          )}
          <ul className="space-y-2">
            {todos?.map((todo) => (
              <li
                key={todo._id}
                className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800"
              >
                <button
                  onClick={() =>
                    completeTodo({
                      todoId: todo._id,
                      completed: !todo.completed,
                    })
                  }
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
                  onClick={() => deleteTodo({ todoId: todo._id })}
                  className="text-gray-400 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <BillingSettings
          isPremium={user?.isPremium ?? false}
          isPremiumPlus={user?.isPremiumPlus ?? false}
        />
      </div>
    </main>
  );
}
