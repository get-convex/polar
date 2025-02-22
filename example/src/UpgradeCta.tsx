import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Star, Settings } from "lucide-react";
import { CheckoutLink, CustomerPortalLink } from "../../src/react";
import { api } from "../convex/_generated/api";
import { useAction, useQuery } from "convex/react";
import { useState, useEffect } from "react";
import { ConfirmationModal } from "./ConfirmationModal";

export function UpgradeCTA() {
  const user = useQuery(api.example.getCurrentUser);
  const products = useQuery(api.example.getProducts);
  const changeCurrentSubscription = useAction(
    api.example.changeCurrentSubscription
  );
  const cancelCurrentSubscription = useAction(
    api.example.cancelCurrentSubscription
  );
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [pendingDowngrade, setPendingDowngrade] = useState<
    "free" | "premiumMonthly" | "premiumYearly"
  >();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [pendingUpgrade, setPendingUpgrade] = useState<
    | "premiumMonthly"
    | "premiumYearly"
    | "premiumPlusMonthly"
    | "premiumPlusYearly"
  >();
  const [billingInterval, setBillingInterval] = useState<"month" | "year">(
    user?.subscription?.recurringInterval ?? "month"
  );

  useEffect(() => {
    if (user?.subscription?.recurringInterval) {
      setBillingInterval(user.subscription.recurringInterval);
    }
  }, [user?.subscription?.recurringInterval]);

  const getProductPrice = (
    productKey:
      | "premiumMonthly"
      | "premiumYearly"
      | "premiumPlusMonthly"
      | "premiumPlusYearly"
  ) => {
    const product = products?.[productKey];
    if (!product?.prices?.length) return;
    const price = product.prices.find(
      (p: { recurringInterval?: "month" | "year" | null }) =>
        p.recurringInterval === billingInterval
    );
    return price?.priceAmount;
  };

  const getDisplayPrice = (
    productKey:
      | "free"
      | "premiumMonthly"
      | "premiumYearly"
      | "premiumPlusMonthly"
      | "premiumPlusYearly"
  ) => {
    if (productKey === "free") return 0;
    return getProductPrice(productKey) ?? 0;
  };

  const calculateYearlySavings = (
    monthlyPrice: number,
    yearlyPrice: number
  ) => {
    const monthlyTotal = monthlyPrice * 12;
    if (monthlyTotal === 0 || yearlyPrice === 0) return 0;
    const savings = (
      ((monthlyTotal - yearlyPrice) / monthlyTotal) *
      100
    ).toFixed(0);
    return Number(savings);
  };

  return (
    <>
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center bg-gray-100 dark:bg-gray-900 rounded-full p-1">
          <button
            onClick={() => setBillingInterval("month")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              billingInterval === "month"
                ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval("year")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
              billingInterval === "year"
                ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            Yearly
            <span className="ml-2 text-xs text-green-500 dark:text-green-400 font-normal">
              Save up to 20%
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={`relative flex flex-col bg-gradient-to-br ${
            user?.isFree
              ? "from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 ring-2 ring-gray-300 dark:ring-gray-700"
              : "from-gray-600 to-gray-700 dark:from-gray-800 dark:to-gray-900"
          } p-6 rounded-lg shadow-md`}
        >
          {user?.isFree && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Star className="w-3 h-3" /> Current Plan
            </div>
          )}
          <div className="flex-1">
            <h2
              className={`text-xl font-semibold mb-4 ${
                user?.isFree ? "text-gray-700 dark:text-gray-300" : "text-white"
              }`}
            >
              Free
              <span className="block text-purple-700 dark:text-purple-300 text-sm mt-1">
                $0/mo
              </span>
            </h2>
            <ul className="space-y-3 mb-6">
              <li
                className={`flex items-center ${
                  user?.isFree
                    ? "text-gray-700 dark:text-gray-300"
                    : "text-white"
                }`}
              >
                <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                Up to 3 todos
              </li>
              <li
                className={`flex items-center ${
                  user?.isFree
                    ? "text-gray-700 dark:text-gray-300"
                    : "text-white"
                }`}
              >
                <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                So many ads, omg
              </li>
              <li
                className={`flex items-center ${
                  user?.isFree
                    ? "text-gray-700 dark:text-gray-300"
                    : "text-white"
                }`}
              >
                <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                "Community support" (forum with a 1.3% response rate 💪)
              </li>
              <li
                className={`flex items-center ${
                  user?.isFree
                    ? "text-gray-700 dark:text-gray-300"
                    : "text-white"
                }`}
              >
                <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                Todo Inc. totally owns your data
              </li>
            </ul>
          </div>
          {!user?.isFree && (
            <Button
              variant="ghost"
              className="w-full mt-2 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={() => {
                setPendingDowngrade("free");
                setShowDowngradeModal(true);
              }}
            >
              Downgrade to Free{" "}
              <ArrowRight className="ml-2 h-4 w-4 rotate-90" />
            </Button>
          )}
        </div>

        <div
          className={`relative flex flex-col bg-gradient-to-br ${
            user?.isPremium && "ring-2 ring-indigo-300 dark:ring-indigo-700"
          } ${
            user?.isPremium || user?.isPremiumPlus
              ? "from-gray-100 to-white dark:from-gray-800 dark:to-gray-900"
              : "from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900"
          } text-white p-6 rounded-lg shadow-md`}
        >
          {user?.isPremium && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Star className="w-3 h-3" /> Current Plan
            </div>
          )}
          <div className="flex-1">
            <h2
              className={`text-xl font-semibold mb-4 ${
                user?.isPremium || user?.isPremiumPlus
                  ? "text-indigo-700 dark:text-indigo-300"
                  : "text-white"
              }`}
            >
              Premium
              <div className="flex flex-col gap-1 mt-1">
                {getProductPrice("premiumMonthly") !== undefined && (
                  <span
                    className={`text-sm ${
                      user?.isPremium || user?.isPremiumPlus
                        ? "text-indigo-700 dark:text-indigo-300"
                        : "text-white"
                    }`}
                  >
                    ${(getProductPrice("premiumMonthly") ?? 0) / 100}/mo
                    {billingInterval === "year" && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 line-through">
                        ${((getProductPrice("premiumMonthly") ?? 0) * 12) / 100}
                        /year
                      </span>
                    )}
                  </span>
                )}
                {billingInterval === "year" &&
                  getProductPrice("premiumYearly") !== undefined && (
                    <span
                      className={`text-sm ${
                        user?.isPremium || user?.isPremiumPlus
                          ? "text-indigo-700 dark:text-indigo-300"
                          : "text-white"
                      }`}
                    >
                      ${(getProductPrice("premiumYearly") ?? 0) / 100}/year
                      {calculateYearlySavings(
                        getProductPrice("premiumMonthly") ?? 0,
                        getProductPrice("premiumYearly") ?? 0
                      ) > 0 && (
                        <span className="ml-2 text-xs text-green-500 dark:text-green-400">
                          Save{" "}
                          {calculateYearlySavings(
                            getProductPrice("premiumMonthly") ?? 0,
                            getProductPrice("premiumYearly") ?? 0
                          )}
                          %
                        </span>
                      )}
                    </span>
                  )}
              </div>
            </h2>
            <ul className="space-y-3 mb-6">
              <li
                className={`flex items-center ${
                  user?.isPremium
                    ? "text-gray-700 dark:text-gray-300"
                    : "text-white"
                }`}
              >
                <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                Up to 6 todos! (Wow!)
              </li>
              <li
                className={`flex items-center ${
                  user?.isPremium
                    ? "text-gray-700 dark:text-gray-300"
                    : "text-white"
                }`}
              >
                <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                5% less ads from 2-4 am on weekdays!
              </li>
              <li
                className={`flex items-center ${
                  user?.isPremium
                    ? "text-gray-700 dark:text-gray-300"
                    : "text-white"
                }`}
              >
                <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                Low priority support for the cheapskates
              </li>
              <li
                className={`flex items-center ${
                  user?.isPremium
                    ? "text-gray-700 dark:text-gray-300"
                    : "text-white"
                }`}
              >
                <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                That's it! It's just premium, calm down.
              </li>
            </ul>
          </div>
          {user?.isPremium && (
            <Button
              variant="ghost"
              className="w-full text-gray-600 hover:text-indigo-700 dark:text-gray-400 dark:hover:text-indigo-300"
              asChild
            >
              <CustomerPortalLink polarApi={api.example}>
                Manage Subscription <Settings className="ml-2 h-4 w-4" />
              </CustomerPortalLink>
            </Button>
          )}
          {user?.isPremiumPlus && (
            <Button
              variant="ghost"
              className="w-full mt-2 text-gray-600 hover:text-indigo-700 dark:text-gray-400 dark:hover:text-indigo-300"
              onClick={() => {
                setPendingDowngrade("premiumMonthly");
                setShowDowngradeModal(true);
              }}
            >
              Downgrade to Premium{" "}
              <ArrowRight className="ml-2 h-4 w-4 rotate-90" />
            </Button>
          )}
          {user?.isFree && products?.premiumMonthly && (
            <Button
              variant="secondary"
              className="w-full bg-white/95 backdrop-blur-sm text-purple-700 hover:bg-white dark:bg-white/10 dark:text-purple-200 dark:hover:bg-white/20"
              asChild
            >
              <CheckoutLink
                polarApi={api.example}
                productId={products.premiumMonthly?.id ?? ""}
                yearlyProductId={products.premiumYearly?.id}
              >
                Upgrade to Premium{" "}
                <div className="ml-2">
                  <ArrowRight size={16} />
                </div>
              </CheckoutLink>
            </Button>
          )}
        </div>

        <div
          className={`relative flex flex-col bg-gradient-to-br ${
            user?.isPremiumPlus
              ? "from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 ring-2 ring-purple-300 dark:ring-purple-700"
              : "from-purple-600 to-pink-600 dark:from-purple-900 dark:to-pink-900 shadow-[0_0_15px_rgba(168,85,247,0.35)] dark:shadow-[0_0_15px_rgba(168,85,247,0.15)]"
          } text-white p-6 rounded-lg shadow-xl`}
        >
          {user?.isPremiumPlus && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Star className="w-3 h-3" /> Current Plan
            </div>
          )}
          {!user?.isPremiumPlus && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
              Most Popular
            </div>
          )}
          <div className="flex-1">
            <h2
              className={`text-xl font-semibold mb-4 ${
                user?.isPremiumPlus
                  ? "text-purple-700 dark:text-purple-300"
                  : "text-white"
              }`}
            >
              Premium Plus
              <div className="flex flex-col gap-1 mt-1">
                {getProductPrice("premiumPlusMonthly") !== undefined && (
                  <span
                    className={`text-sm ${
                      user?.isPremiumPlus
                        ? "text-purple-700 dark:text-purple-300"
                        : "text-white"
                    }`}
                  >
                    ${(getProductPrice("premiumPlusMonthly") ?? 0) / 100}/mo
                    {billingInterval === "year" && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 line-through">
                        $
                        {((getProductPrice("premiumPlusMonthly") ?? 0) * 12) /
                          100}
                        /year
                      </span>
                    )}
                  </span>
                )}
                {billingInterval === "year" &&
                  getProductPrice("premiumPlusYearly") !== undefined && (
                    <span
                      className={`text-sm ${
                        user?.isPremiumPlus
                          ? "text-purple-700 dark:text-purple-300"
                          : "text-white"
                      }`}
                    >
                      ${(getProductPrice("premiumPlusYearly") ?? 0) / 100}/year
                      {calculateYearlySavings(
                        getProductPrice("premiumPlusMonthly") ?? 0,
                        getProductPrice("premiumPlusYearly") ?? 0
                      ) > 0 && (
                        <span className="ml-2 text-xs text-green-500 dark:text-green-400">
                          Save{" "}
                          {calculateYearlySavings(
                            getProductPrice("premiumPlusMonthly") ?? 0,
                            getProductPrice("premiumPlusYearly") ?? 0
                          )}
                          %
                        </span>
                      )}
                    </span>
                  )}
              </div>
            </h2>
            <ul className="space-y-3 mb-6">
              <li
                className={`flex items-center ${
                  user?.isPremiumPlus
                    ? "text-gray-700 dark:text-gray-300"
                    : "text-white"
                }`}
              >
                <Check
                  className={`w-4 h-4 mr-2 flex-shrink-0 ${
                    user?.isPremiumPlus && "text-purple-200"
                  }`}
                />
                All the todos you can todo
              </li>
              <li
                className={`flex items-center ${
                  user?.isPremiumPlus
                    ? "text-gray-700 dark:text-gray-300"
                    : "text-white"
                }`}
              >
                <Check
                  className={`w-4 h-4 mr-2 flex-shrink-0 ${
                    user?.isPremiumPlus && "text-purple-200"
                  }`}
                />
                24/7 support (3-5 day response time 🙌)
              </li>
              <li
                className={`flex items-center ${
                  user?.isPremiumPlus
                    ? "text-gray-700 dark:text-gray-300"
                    : "text-white"
                }`}
              >
                <Check
                  className={`w-4 h-4 mr-2 flex-shrink-0 ${
                    user?.isPremiumPlus && "text-purple-200"
                  }`}
                />
                Todo Inc. will steal less of your data**
              </li>
              <li
                className={`flex items-center ${
                  user?.isPremiumPlus
                    ? "text-gray-700 dark:text-gray-300"
                    : "text-white"
                }`}
              >
                <Check
                  className={`w-4 h-4 mr-2 flex-shrink-0 ${
                    user?.isPremiumPlus && "text-purple-200"
                  }`}
                />
                Advanced analytics (for us)
              </li>
            </ul>
          </div>
          {user?.isPremiumPlus && (
            <Button
              variant="ghost"
              className="w-full text-gray-600 hover:text-purple-700 dark:text-gray-400 dark:hover:text-purple-300"
              asChild
            >
              <CustomerPortalLink polarApi={api.example}>
                Manage Subscription <Settings className="ml-2 h-4 w-4" />
              </CustomerPortalLink>
            </Button>
          )}
          {user?.isPremium && (
            <Button
              variant="secondary"
              className="w-full bg-white/95 backdrop-blur-sm text-purple-700 hover:bg-white dark:bg-white/10 dark:text-purple-200 dark:hover:bg-white/20"
              onClick={() => {
                setPendingUpgrade(
                  billingInterval === "year"
                    ? "premiumPlusYearly"
                    : "premiumPlusMonthly"
                );
                setShowUpgradeModal(true);
              }}
            >
              Upgrade to Premium Plus
              <div className="ml-2">
                <ArrowRight size={16} />
              </div>
            </Button>
          )}
          {user?.isFree && products?.premiumPlusMonthly && (
            <Button
              variant="secondary"
              className="w-full bg-white/95 backdrop-blur-sm text-purple-700 hover:bg-white dark:bg-white/10 dark:text-purple-200 dark:hover:bg-white/20"
              asChild
            >
              <CheckoutLink
                polarApi={api.example}
                productId={products.premiumPlusMonthly?.id ?? ""}
                yearlyProductId={products.premiumPlusYearly?.id}
              >
                Upgrade to Premium Plus{" "}
                <div className="ml-2">
                  <ArrowRight size={16} />
                </div>
              </CheckoutLink>
            </Button>
          )}
        </div>
      </div>

      <ConfirmationModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        title={`Upgrade to ${pendingUpgrade?.includes("Plus") ? "Premium Plus" : "Premium"}`}
        description={
          <>
            <p className="mb-4">
              {pendingUpgrade?.includes("Plus")
                ? "Get the ultimate todo experience with Premium Plus! Unlimited todos, no ads, and priority support!"
                : "Upgrade to Premium and get access to 6 todos, fewer ads, and support for the cheapskates!"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your new subscription will be{" "}
              <span className="font-medium text-gray-900 dark:text-gray-200">
                ${getDisplayPrice(pendingUpgrade ?? "premiumMonthly") / 100}/
                {billingInterval}
              </span>
              . The change will take effect immediately and any difference will
              be prorated.
            </p>
          </>
        }
        actionLabel="Confirm Upgrade"
        onConfirm={async () => {
          if (!pendingUpgrade) return;
          const productId = products?.[pendingUpgrade]?.id;
          if (!productId) return;
          await changeCurrentSubscription({ productId });
          setShowUpgradeModal(false);
        }}
      />
      <ConfirmationModal
        open={showDowngradeModal}
        onOpenChange={setShowDowngradeModal}
        title="Downgrade Subscription"
        description={
          <>
            <p className="mb-4">
              {pendingDowngrade === "free"
                ? "Are you sure you want to cancel your subscription?"
                : "Are you sure you want to downgrade your subscription?"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {pendingDowngrade === "free" ? (
                "Your subscription will be cancelled immediately and you'll lose access to premium features. Any remaining time will be prorated and refunded."
              ) : (
                <>
                  Your new subscription will be{" "}
                  <span className="font-medium text-gray-900 dark:text-gray-200">
                    ${getDisplayPrice(pendingDowngrade ?? "free") / 100}/
                    {billingInterval}
                  </span>
                  . The change will take effect immediately and any difference
                  will be prorated.
                </>
              )}
            </p>
          </>
        }
        actionLabel={
          pendingDowngrade === "free"
            ? "Cancel Subscription"
            : "Confirm Downgrade"
        }
        onConfirm={async () => {
          if (!pendingDowngrade) return;
          if (pendingDowngrade === "free") {
            await cancelCurrentSubscription({ revokeImmediately: true });
          } else {
            const productId = products?.[pendingDowngrade]?.id;
            if (!productId) return;
            await changeCurrentSubscription({ productId });
          }
          setShowDowngradeModal(false);
        }}
        variant="destructive"
      />
    </>
  );
}
