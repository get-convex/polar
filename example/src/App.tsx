import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { CheckoutLink, CustomerPortalLink } from "@convex-dev/polar/react";
import {
  insertTodoOptimistic,
  completeTodoOptimistic,
  deleteTodoOptimistic,
} from "@/optimistic";

function PriceDisplay({ price }: { price: any }) {
  switch (price.amountType) {
    case "fixed":
      return (
        <span>
          ${(price.priceAmount ?? 0) / 100}
          {price.recurringInterval ? `/${price.recurringInterval}` : ""}
        </span>
      );
    case "free":
      return <span>Free</span>;
    case "custom":
      return (
        <span>
          Pay what you want
          {price.minimumAmount != null && (
            <> (min ${price.minimumAmount / 100})</>
          )}
          {price.maximumAmount != null && (
            <> (max ${price.maximumAmount / 100})</>
          )}
          {price.presetAmount != null && (
            <> &middot; suggested ${price.presetAmount / 100}</>
          )}
        </span>
      );
    case "seat_based":
      return (
        <div className="text-xs space-y-0.5">
          <span className="font-medium">Per-seat pricing:</span>
          {price.seatTiers?.map(
            (
              tier: { minSeats: number; maxSeats: number | null; pricePerSeat: number },
              i: number,
            ) => (
              <div key={i}>
                {tier.minSeats}
                {tier.maxSeats ? `–${tier.maxSeats}` : "+"} seats: $
                {tier.pricePerSeat / 100}/seat
              </div>
            ),
          )}
        </div>
      );
    case "metered_unit":
      return (
        <span>
          ${price.unitAmount ?? "?"}/unit
          {price.meter?.name && <> ({price.meter.name})</>}
          {price.capAmount != null && <> &middot; cap ${price.capAmount / 100}</>}
        </span>
      );
    default:
      return <span>{price.amountType ?? "Unknown"}</span>;
  }
}

export default function TodoList() {
  const user = useQuery(api.example.getCurrentUser);
  const todos = useQuery(api.example.listTodos);
  const products = useQuery(api.example.getConfiguredProducts);
  const allProducts = useQuery(api.example.listAllProducts);
  const insertTodo = useMutation(api.example.insertTodo).withOptimisticUpdate(
    insertTodoOptimistic
  );
  const completeTodo = useMutation(
    api.example.completeTodo
  ).withOptimisticUpdate(completeTodoOptimistic);
  const deleteTodo = useMutation(api.example.deleteTodo).withOptimisticUpdate(
    deleteTodoOptimistic
  );
  const cancelSubscription = useAction(api.example.cancelCurrentSubscription);
  const changeSubscription = useAction(api.example.changeCurrentSubscription);
  const [newTodo, setNewTodo] = useState("");

  const todosLength = todos?.length ?? 0;
  console.log("user", user);
  const isAtMaxTodos = user?.maxTodos && todosLength >= user.maxTodos;

  const {
    premiumMonthly,
    premiumYearly,
    premiumPlusMonthly,
    premiumPlusYearly,
  } = products ?? {};

  const getButtonText = (targetProductId: string) => {
    if (!user?.subscription) return "Upgrade";
    const isPremium =
      user.subscription.productId === premiumMonthly?.id ||
      user.subscription.productId === premiumYearly?.id;
    const targetIsPremiumPlus =
      targetProductId === premiumPlusMonthly?.id ||
      targetProductId === premiumPlusYearly?.id;
    if (isPremium && targetIsPremiumPlus) {
      return "Upgrade";
    }
    return "Downgrade";
  };

  const handlePlanChange = async (productId: string) => {
    if (!user?.subscription) return;
    const action = getButtonText(productId);
    if (
      confirm(
        `Are you sure you want to ${action.toLowerCase()} your subscription? Any price difference will be prorated.`
      )
    ) {
      await changeSubscription({ productId });
    }
  };

  const handleCancelSubscription = async () => {
    if (
      confirm(
        "Are you sure you want to cancel your subscription? This will immediately end your subscription and any remaining time will be prorated and refunded."
      )
    ) {
      await cancelSubscription({ revokeImmediately: true });
    }
  };

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
        {/* Introduction */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-950 border border-transparent dark:border-gray-900 rounded-lg shadow-lg dark:shadow-gray-800/30">
          <h1 className="text-2xl font-light mb-4 text-gray-800 dark:text-gray-100">
            Polar Subscription Example
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This example demonstrates Polar's subscription management
            capabilities including trial support, multiple price types, and
            product benefits. Test it out by:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400 mb-4">
            <li>
              Adding todos (limits: Free=3, Premium=6, Premium Plus=unlimited)
            </li>
            <li>Starting a free trial for Premium</li>
            <li>Upgrading/downgrading between plans</li>
            <li>Managing subscriptions via the customer portal</li>
            <li>Browsing the product showcase for all synced products</li>
          </ol>
        </div>

        {/* Todo List */}
        <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-950 border border-transparent dark:border-gray-900 rounded-lg shadow-lg dark:shadow-gray-800/30">
          <h2 className="text-3xl font-light mb-6 text-gray-800 dark:text-gray-100">
            Todo List
          </h2>
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
                {user?.isTrialing && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    Trial
                    {user.trialEnd && (
                      <> &middot; ends {new Date(user.trialEnd).toLocaleDateString()}</>
                    )}
                  </span>
                )}
                {user?.subscription?.amount && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ${user.subscription.amount / 100}/
                    {user.subscription.recurringInterval}
                  </span>
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  •{" "}
                  {user?.isPremiumPlus
                    ? "Unlimited todos"
                    : user?.isPremium
                      ? "Up to 6 todos"
                      : "Up to 3 todos"}
                </span>
              </div>
            </div>

            {/* Available Plans */}
            {premiumMonthly && !user?.isTrialing && (
              <div>
                <h3 className="text-lg font-medium mb-2">
                  {user?.isFree ? "Available Plans:" : "Change Plan:"}
                </h3>
                <div className="space-y-2">
                  {/* Premium Monthly */}
                  {premiumMonthly && (
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                      <div>
                        <h4 className="font-medium">Premium</h4>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              $
                              {(premiumMonthly.prices[0].priceAmount ?? 0) /
                                100}
                              /month
                            </span>
                            {premiumYearly && (
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                or $
                                {(premiumYearly.prices[0].priceAmount ?? 0) /
                                  100}
                                /year
                              </span>
                            )}
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              • Up to 6 todos
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {user?.subscription?.productId !== premiumMonthly.id &&
                          user?.subscription?.productId !== premiumYearly?.id &&
                          (user?.isFree ? (
                            <div className="flex items-center gap-3">
                              <CheckoutLink
                                polarApi={{
                                  generateCheckoutLink:
                                    api.example.generateCheckoutLink,
                                }}
                                productIds={[premiumMonthly.id]}
                                trialInterval="day"
                                trialIntervalCount={7}
                                className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                              >
                                Start 7-day free trial
                              </CheckoutLink>
                              <CheckoutLink
                                polarApi={{
                                  generateCheckoutLink:
                                    api.example.generateCheckoutLink,
                                }}
                                productIds={[
                                  premiumMonthly.id,
                                  premiumYearly?.id,
                                ].filter((id): id is string => id !== undefined)}
                                className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                embed={false}
                              >
                                Upgrade to Premium (redirect)
                              </CheckoutLink>
                            </div>
                          ) : (
                            <Button
                              variant="link"
                              className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 p-0 h-auto"
                              onClick={() => handlePlanChange(premiumMonthly.id)}
                            >
                              {getButtonText(premiumMonthly.id)} to Premium
                            </Button>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Premium Plus Monthly */}
                  {premiumPlusMonthly && (
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                      <div>
                        <h4 className="font-medium">Premium Plus</h4>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              $
                              {(premiumPlusMonthly.prices[0].priceAmount ?? 0) /
                                100}
                              /month
                            </span>
                            {premiumPlusYearly && (
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                or $
                                {(premiumPlusYearly.prices[0].priceAmount ??
                                  0) / 100}
                                /year
                              </span>
                            )}
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              • Unlimited todos
                            </span>
                          </div>
                        </div>
                      </div>
                      {user?.subscription?.productId !==
                        premiumPlusMonthly.id &&
                        user?.subscription?.productId !==
                          premiumPlusYearly?.id &&
                        (user?.isFree ? (
                          <CheckoutLink
                            polarApi={{
                              generateCheckoutLink:
                                api.example.generateCheckoutLink,
                            }}
                            productIds={[
                              premiumPlusMonthly.id,
                              premiumPlusYearly?.id,
                            ].filter((id): id is string => id !== undefined)}
                            className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            Upgrade to Premium Plus (modal)
                          </CheckoutLink>
                        ) : (
                          <Button
                            variant="link"
                            className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 p-0 h-auto"
                            onClick={() =>
                              handlePlanChange(premiumPlusMonthly.id)
                            }
                          >
                            {getButtonText(premiumPlusMonthly.id)} to Premium
                            Plus
                          </Button>
                        ))}
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
                  onClick={handleCancelSubscription}
                >
                  Cancel Subscription
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Products Showcase */}
        <div className="mt-8 p-6 bg-white dark:bg-gray-950 border border-transparent dark:border-gray-900 rounded-lg shadow-lg dark:shadow-gray-800/30">
          <h2 className="text-2xl font-light mb-2 text-gray-800 dark:text-gray-100">
            Products Showcase
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            All synced products from Polar, demonstrating different price types
            and benefits.
          </p>
          {allProducts && allProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allProducts.map((product: any) => (
                <div
                  key={product._id}
                  className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg space-y-3"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-gray-800 dark:text-gray-100">
                      {product.name}
                    </h3>
                    {product.trialInterval && product.trialIntervalCount && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                        {product.trialIntervalCount} {product.trialInterval} free trial
                      </span>
                    )}
                  </div>
                  {product.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {product.description}
                    </p>
                  )}

                  {/* Prices */}
                  <div className="space-y-1">
                    {product.prices.map((price: any, i: number) => (
                      <div
                        key={price.id ?? i}
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
                        <PriceDisplay price={price} />
                      </div>
                    ))}
                  </div>

                  {/* Benefits */}
                  {product.benefits && product.benefits.length > 0 && (
                    <ul className="space-y-1 pt-2 border-t border-gray-100 dark:border-gray-800">
                      {product.benefits.map((benefit: any) => (
                        <li
                          key={benefit.id}
                          className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                        >
                          <span className="text-green-500 mt-0.5">&#10003;</span>
                          <span>{benefit.description}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No products synced yet. Run the seed script and sync products from
              Polar.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
