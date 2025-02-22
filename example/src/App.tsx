import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { CheckoutLink, CustomerPortalLink } from "../../src/react";

export default function TodoList() {
  const user = useQuery(api.example.getCurrentUser);
  const todos = useQuery(api.example.listTodos);
  const products = useQuery(api.example.getProducts);
  const insertTodo = useMutation(api.example.insertTodo);
  const completeTodo = useMutation(api.example.completeTodo);
  const deleteTodo = useMutation(api.example.deleteTodo);
  const cancelSubscription = useAction(api.example.cancelCurrentSubscription);
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
        {/* Todo List */}
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

        {/* Simple Billing UI */}
        <div className="mt-8 p-6 bg-white dark:bg-gray-950 border border-transparent dark:border-gray-900 rounded-lg shadow-lg dark:shadow-gray-800/30">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-light text-gray-800 dark:text-gray-100">
              Subscription
            </h2>
            {user?.subscription && (
              <CustomerPortalLink
                polarApi={{
                  generateCustomerPortalUrl:
                    api.example.generateCustomerPortalUrl,
                }}
                className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Manage Subscription
              </CustomerPortalLink>
            )}
          </div>

          <div className="space-y-4">
            {/* Current Plan */}
            <div>
              <h3 className="text-lg font-medium mb-2">Current Plan:</h3>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                  {user?.subscription?.product.name || "Free"}
                </span>
                {user?.subscription?.amount && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ${user.subscription.amount / 100}/
                    {user.subscription.recurringInterval}
                  </span>
                )}
              </div>
            </div>

            {/* Available Plans */}
            {user?.isFree && products?.premiumMonthly && (
              <div>
                <h3 className="text-lg font-medium mb-2">Available Plans:</h3>
                <div className="space-y-2">
                  {/* Premium Monthly */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <div>
                      <h4 className="font-medium">Premium</h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          $
                          {(products.premiumMonthly.prices[0].priceAmount ??
                            0) / 100}
                          /month
                        </p>
                        {products.premiumYearly && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            $
                            {(products.premiumYearly.prices[0].priceAmount ??
                              0) / 100}
                            /year
                          </p>
                        )}
                      </div>
                    </div>
                    <CheckoutLink
                      polarApi={{
                        generateCheckoutLink: api.example.generateCheckoutLink,
                      }}
                      productId={products.premiumMonthly.id}
                      yearlyProductId={products.premiumYearly?.id}
                      className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Upgrade to Premium
                    </CheckoutLink>
                  </div>

                  {/* Premium Plus Monthly */}
                  {products.premiumPlusMonthly && (
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                      <div>
                        <h4 className="font-medium">Premium Plus</h4>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            $
                            {(products.premiumPlusMonthly.prices[0]
                              .priceAmount ?? 0) / 100}
                            /month
                          </p>
                          {products.premiumPlusYearly && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              $
                              {(products.premiumPlusYearly.prices[0]
                                .priceAmount ?? 0) / 100}
                              /year
                            </p>
                          )}
                        </div>
                      </div>
                      <CheckoutLink
                        polarApi={{
                          generateCheckoutLink:
                            api.example.generateCheckoutLink,
                        }}
                        productId={products.premiumPlusMonthly.id}
                        yearlyProductId={products.premiumPlusYearly?.id}
                        className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Upgrade to Premium Plus
                      </CheckoutLink>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cancel Subscription */}
            {user?.subscription && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <Button
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  onClick={() =>
                    cancelSubscription({ revokeImmediately: true })
                  }
                >
                  Cancel Subscription
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
