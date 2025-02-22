import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Settings } from "lucide-react";
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

  const currentPrice = isPremiumPlus
    ? "$20/month or $200/year"
    : isPremium
      ? "$10/month or $100/year"
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
        <div className="flex items-center gap-4">
          {!showPricingPlans && (isPremium || isPremiumPlus) && (
            <CustomerPortalLink
              polarApi={api.example}
              className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors"
            >
              <Settings className="w-3.5 h-3.5" /> Manage
            </CustomerPortalLink>
          )}
          <Button
            variant="outline"
            onClick={() => setShowPricingPlans((prev) => !prev)}
            className="text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
          >
            {showPricingPlans ? (
              <>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Current Plan
              </>
            ) : (
              "Change Plan"
            )}
          </Button>
        </div>
      </div>

      {!showPricingPlans && (
        <div className="mt-4">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-medium">Current Plan:</h3>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                {currentPlan}
              </span>
              {currentPrice !== "Free" && (
                <div className="flex flex-col text-sm">
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    {isPremiumPlus ? "$20/month" : "$10/month"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    or {isPremiumPlus ? "$200/year" : "$100/year"}
                  </span>
                </div>
              )}
            </div>
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
