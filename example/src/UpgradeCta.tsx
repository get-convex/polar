import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Star, Settings } from "lucide-react";
import { CheckoutLink, CustomerPortalLink } from "../../src/react";
import { api } from "../convex/_generated/api";
import { useAction } from "convex/react";
import { useState } from "react";
import { ConfirmationModal } from "./ConfirmationModal";

export function UpgradeCTA({
  isPremium,
  isPremiumPlus,
}: {
  isPremium: boolean;
  isPremiumPlus: boolean;
}) {
  const changeCurrentSubscription = useAction(
    api.example.changeCurrentSubscription
  );
  const cancelCurrentSubscription = useAction(
    api.example.cancelCurrentSubscription
  );
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [pendingDowngrade, setPendingDowngrade] = useState<
    "premium" | "free"
  >();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [pendingUpgrade, setPendingUpgrade] = useState<
    "premium" | "premiumPlus"
  >();
  const [showPricingPlans, setShowPricingPlans] = useState(false);

  const currentPlan = isPremiumPlus
    ? "Premium Plus"
    : isPremium
      ? "Premium"
      : "Free";
  const features = isPremiumPlus
    ? ["Unlimited todos", "No ads", "Priority support", "Advanced analytics"]
    : isPremium
      ? ["Up to 6 todos", "Reduced ads", "Basic support"]
      : ["Up to 3 todos", "Ad supported", "Community support"];

  return (
    <div className="mt-8 p-6 bg-white dark:bg-gray-950 border border-transparent dark:border-gray-900 rounded-lg shadow-lg dark:shadow-gray-800/30">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-light text-gray-800 dark:text-gray-100">
            Billing Settings
          </h2>
          <div className="mt-4">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-medium">Current Plan:</h3>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                {currentPlan}
              </span>
            </div>
            <ul className="mt-4 space-y-2">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center text-gray-600 dark:text-gray-400"
                >
                  <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPricingPlans((prev) => !prev)}
            className="text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
          >
            {showPricingPlans ? "Hide Plans" : "Change Plan"}
          </Button>
          {(isPremium || isPremiumPlus) && (
            <CustomerPortalLink
              polarApi={api.example}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-2"
            >
              <Settings className="w-4 h-4" /> Manage Subscription
            </CustomerPortalLink>
          )}
        </div>
      </div>

      {showPricingPlans && (
        <>
          <div className="h-px bg-gray-200 dark:bg-gray-800 my-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`relative flex flex-col bg-gradient-to-br ${
                !isPremium && !isPremiumPlus
                  ? "from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 ring-2 ring-gray-300 dark:ring-gray-700"
                  : "from-gray-600 to-gray-700 dark:from-gray-800 dark:to-gray-900"
              } p-6 rounded-lg shadow-md`}
            >
              {!isPremium && !isPremiumPlus && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" /> Current Plan
                </div>
              )}
              <div className="flex-1">
                <h2
                  className={`text-xl font-semibold mb-4 ${
                    !isPremium && !isPremiumPlus
                      ? "text-gray-700 dark:text-gray-300"
                      : "text-white"
                  }`}
                >
                  Free
                </h2>
                <ul className="space-y-3 mb-6">
                  <li
                    className={`flex items-center ${
                      !isPremium && !isPremiumPlus
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-white"
                    }`}
                  >
                    <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                    Up to 3 todos
                  </li>
                  <li
                    className={`flex items-center ${
                      !isPremium && !isPremiumPlus
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-white"
                    }`}
                  >
                    <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                    So many ads, omg
                  </li>
                  <li
                    className={`flex items-center ${
                      !isPremium && !isPremiumPlus
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-white"
                    }`}
                  >
                    <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                    "Community support" (tweet at randos)
                  </li>
                  <li
                    className={`flex items-center ${
                      !isPremium && !isPremiumPlus
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-white"
                    }`}
                  >
                    <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                    Todo Inc. totally owns your data
                  </li>
                </ul>
              </div>
              {(isPremium || isPremiumPlus) && (
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
                isPremium
                  ? "from-gray-100 to-white dark:from-gray-800 dark:to-gray-900"
                  : "from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900"
              } ${
                isPremium && !isPremiumPlus
                  ? "ring-2 ring-indigo-300 dark:ring-indigo-700"
                  : ""
              } text-white p-6 rounded-lg shadow-md`}
            >
              {isPremium && !isPremiumPlus && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" /> Current Plan
                </div>
              )}
              <div className="flex-1">
                <h2
                  className={`text-xl font-semibold mb-4 ${
                    isPremium || isPremiumPlus
                      ? "text-indigo-700 dark:text-indigo-300"
                      : "text-white"
                  }`}
                >
                  Premium
                </h2>
                <ul className="space-y-3 mb-6">
                  <li
                    className={`flex items-center ${
                      isPremium
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-white"
                    }`}
                  >
                    <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                    Up to 6 todos! (Wow!)
                  </li>
                  <li
                    className={`flex items-center ${
                      isPremium
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-white"
                    }`}
                  >
                    <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                    5% less ads from 2-4 am on weekdays!
                  </li>
                  <li
                    className={`flex items-center ${
                      isPremium
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-white"
                    }`}
                  >
                    <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                    Low priority support for the cheapskates
                  </li>
                  <li
                    className={`flex items-center ${
                      isPremium
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-white"
                    }`}
                  >
                    <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                    That's it! It's just premium, calm down.
                  </li>
                </ul>
              </div>
              {isPremium && !isPremiumPlus && (
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
              {isPremiumPlus && (
                <Button
                  variant="ghost"
                  className="w-full mt-2 text-gray-600 hover:text-indigo-700 dark:text-gray-400 dark:hover:text-indigo-300"
                  onClick={() => {
                    setPendingDowngrade("premium");
                    setShowDowngradeModal(true);
                  }}
                >
                  Downgrade to Premium{" "}
                  <ArrowRight className="ml-2 h-4 w-4 rotate-90" />
                </Button>
              )}
              {!isPremium && !isPremiumPlus && (
                <Button
                  variant="secondary"
                  className="w-full bg-white/95 backdrop-blur-sm text-purple-700 hover:bg-white dark:bg-white/10 dark:text-purple-200 dark:hover:bg-white/20"
                  asChild
                >
                  <CheckoutLink polarApi={api.example} productKey="premium">
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
                isPremiumPlus
                  ? "from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 ring-2 ring-purple-300 dark:ring-purple-700"
                  : "from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-900 dark:via-purple-900 dark:to-indigo-900"
              } text-white p-6 rounded-lg shadow-xl`}
            >
              {isPremiumPlus ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" /> Current Plan
                </div>
              ) : (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="flex-1">
                <h2
                  className={`text-xl font-semibold mb-4 ${
                    isPremiumPlus
                      ? "text-purple-700 dark:text-purple-300"
                      : "text-white"
                  }`}
                >
                  Premium Plus
                </h2>
                <ul className="space-y-3 mb-6">
                  <li
                    className={`flex items-center ${
                      isPremiumPlus
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-white"
                    }`}
                  >
                    <Check
                      className={`w-4 h-4 mr-2 flex-shrink-0 ${
                        isPremiumPlus ? "" : "text-purple-200"
                      }`}
                    />
                    All the todos you can todo
                  </li>
                  <li
                    className={`flex items-center ${
                      isPremiumPlus
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-white"
                    }`}
                  >
                    <Check
                      className={`w-4 h-4 mr-2 flex-shrink-0 ${
                        isPremiumPlus ? "" : "text-purple-200"
                      }`}
                    />
                    24/7 support (3-5 day response time 🙌)
                  </li>
                  <li
                    className={`flex items-center ${
                      isPremiumPlus
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-white"
                    }`}
                  >
                    <Check
                      className={`w-4 h-4 mr-2 flex-shrink-0 ${
                        isPremiumPlus ? "" : "text-purple-200"
                      }`}
                    />
                    Todo Inc. will steal less of your data**
                  </li>
                  <li
                    className={`flex items-center ${
                      isPremiumPlus
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-white"
                    }`}
                  >
                    <Check
                      className={`w-4 h-4 mr-2 flex-shrink-0 ${
                        isPremiumPlus ? "" : "text-purple-200"
                      }`}
                    />
                    Advanced analytics (for us)
                  </li>
                </ul>
              </div>
              {isPremiumPlus && (
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
              {isPremium && !isPremiumPlus && (
                <Button
                  variant="secondary"
                  className="w-full bg-white/95 backdrop-blur-sm text-purple-700 hover:bg-white dark:bg-white/10 dark:text-purple-200 dark:hover:bg-white/20"
                  onClick={() => {
                    setPendingUpgrade("premiumPlus");
                    setShowUpgradeModal(true);
                  }}
                >
                  Upgrade to Premium Plus
                  <div className="ml-2">
                    <ArrowRight size={16} />
                  </div>
                </Button>
              )}
              {!isPremium && !isPremiumPlus && (
                <Button
                  variant="secondary"
                  className="w-full bg-white/95 backdrop-blur-sm text-purple-700 hover:bg-white dark:bg-white/10 dark:text-purple-200 dark:hover:bg-white/20"
                  asChild
                >
                  <CheckoutLink polarApi={api.example} productKey="premiumPlus">
                    Upgrade to Premium Plus{" "}
                    <div className="ml-2">
                      <ArrowRight size={16} />
                    </div>
                  </CheckoutLink>
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      <ConfirmationModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        title={`Upgrade to ${pendingUpgrade === "premium" ? "Premium" : "Premium Plus"}`}
        description={
          pendingUpgrade === "premium"
            ? "Upgrade to Premium and get access to 6 todos, fewer ads, and support for the cheapskates!"
            : "Get the ultimate todo experience with Premium Plus! Unlimited todos, no ads, and priority support!"
        }
        actionLabel="Confirm Upgrade"
        onConfirm={() => {
          if (!pendingUpgrade) return;
          changeCurrentSubscription({
            productKey: pendingUpgrade,
          });
        }}
      />
      <ConfirmationModal
        open={showDowngradeModal}
        onOpenChange={setShowDowngradeModal}
        title={`Downgrade to ${pendingDowngrade === "premium" ? "Premium" : "Free"}`}
        description={
          pendingDowngrade === "premium"
            ? "Your Premium Plus features will remain active until the end of your current billing period. After that, you'll be moved to the Premium plan."
            : "Your premium features will remain active until the end of your current billing period. After that, you'll be moved to the Free plan."
        }
        actionLabel="Confirm Downgrade"
        onConfirm={() => {
          if (!pendingDowngrade) return;
          if (pendingDowngrade === "free") {
            cancelCurrentSubscription({
              revokeImmediately: true,
            });
          } else {
            changeCurrentSubscription({
              productKey: pendingDowngrade,
            });
          }
        }}
        variant="destructive"
      />
    </div>
  );
}
