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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-light mb-6 text-gray-800">Todo List</h1>
      <form onSubmit={addTodo} className="mb-6">
        <Input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task"
          className="w-full text-lg py-2 border-b border-gray-300 focus:border-gray-500 transition-colors duration-300"
        />
      </form>
      {!isPremium && todos.length >= MAX_FREE_TODOS && (
        <div className="flex items-center text-yellow-600 mb-4">
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
            className="flex items-center justify-between py-2 border-b border-gray-200"
          >
            <button
              onClick={() => toggleTodo(todo.id)}
              className={`text-lg flex-grow text-left ${todo.completed ? "line-through text-gray-400" : "text-gray-800"}`}
            >
              {todo.text}
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteTodo(todo.id)}
              className="text-gray-400 hover:text-red-500"
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>
      {!isPremium && <UpgradeCTA />}
    </div>
  );
}
