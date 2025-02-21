import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Settings } from "lucide-react";
import { CustomerPortalLink } from "../../src/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { UpgradeCTA } from "@/UpgradeCta";

export function BillingSettings({
  isPremium,
  isPremiumPlus,
}: {
  isPremium: boolean;
  isPremiumPlus: boolean;
}) {
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
        <h2 className="text-2xl font-light text-gray-800 dark:text-gray-100">
          {showPricingPlans ? "Available Plans" : "Billing Settings"}
        </h2>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPricingPlans((prev) => !prev)}
            className="text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
          >
            {showPricingPlans ? (
              <>
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Back to Current Plan
              </>
            ) : (
              "Change Plan"
            )}
          </Button>
          {!showPricingPlans && (isPremium || isPremiumPlus) && (
            <CustomerPortalLink
              polarApi={api.example}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-2"
            >
              <Settings className="w-4 h-4" /> Manage Subscription
            </CustomerPortalLink>
          )}
        </div>
      </div>

      {!showPricingPlans && (
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
      )}
      {showPricingPlans && (
        <UpgradeCTA
          isFree={!isPremium && !isPremiumPlus}
          isPremium={isPremium && !isPremiumPlus}
          isPremiumPlus={isPremiumPlus}
        />
      )}
    </div>
  );
}
