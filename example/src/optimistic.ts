import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { OptimisticUpdate } from "convex/browser";

export const insertTodoOptimistic: OptimisticUpdate<
  (typeof api.example.insertTodo)["_args"]
> = (localStore, args) => {
  const user = localStore.getQuery(api.example.getCurrentUser, undefined);
  const todos = localStore.getQuery(api.example.listTodos, undefined);
  if (!todos || !user) {
    return;
  }
  localStore.setQuery(api.example.listTodos, {}, [
    ...todos,
    {
      _id: crypto.randomUUID() as Id<"todos">,
      _creationTime: Date.now(),
      userId: user._id,
      text: args.text,
      completed: false,
    },
  ]);
};

export const completeTodoOptimistic: OptimisticUpdate<
  (typeof api.example.completeTodo)["_args"]
> = (localStore, args) => {
  const todos = localStore.getQuery(api.example.listTodos, undefined);
  if (!todos) {
    return;
  }
  const todo = todos.find((todo) => todo._id === args.todoId);
  if (!todo) {
    return;
  }
  localStore.setQuery(
    api.example.listTodos,
    {},
    todos.map((todo) =>
      todo._id === args.todoId ? { ...todo, completed: !todo.completed } : todo
    )
  );
};

export const deleteTodoOptimistic: OptimisticUpdate<
  (typeof api.example.deleteTodo)["_args"]
> = (localStore, args) => {
  const todos = localStore.getQuery(api.example.listTodos, undefined);
  if (!todos) {
    return;
  }
  localStore.setQuery(
    api.example.listTodos,
    {},
    todos.filter((todo) => todo._id !== args.todoId)
  );
};
