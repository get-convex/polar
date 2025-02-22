import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Settings } from "lucide-react";
import { CustomerPortalLink } from "../../src/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { UpgradeCTA } from "@/UpgradeCta";
import { useQuery } from "convex/react";

export function BillingSettings() {
  const user = useQuery(api.example.getCurrentUser);
  const [showPricingPlans, setShowPricingPlans] = useState(false);

  const getFeatures = () => {
    switch (user?.subscription?.productKey) {
      case "premiumMonthly":
      case "premiumYearly":
        return ["Up to 6 todos", "Reduced ads", "Basic support"];
      case "premiumPlusMonthly":
      case "premiumPlusYearly":
        return [
          "Unlimited todos",
          "No ads",
          "Priority support",
          "Advanced analytics",
        ];
      default:
        return ["Up to 3 todos", "Ad supported", "Community support"];
    }
  };

  const currentPlan = user?.subscription;

  return (
    <div className="mt-8 p-6 bg-white dark:bg-gray-950 border border-transparent dark:border-gray-900 rounded-lg shadow-lg dark:shadow-gray-800/30">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-light text-gray-800 dark:text-gray-100">
          {showPricingPlans ? "Available Plans" : "Billing Settings"}
        </h2>
        <div className="flex items-center gap-4">
          {!showPricingPlans && user?.subscription && (
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
                {currentPlan?.product.name || "Free"}
              </span>
              {currentPlan?.amount && (
                <div className="flex flex-col text-sm">
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    ${currentPlan.amount / 100}/{currentPlan.recurringInterval}
                  </span>
                </div>
              )}
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {getFeatures().map((feature) => (
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
        <div className="mt-12">
          <UpgradeCTA />
        </div>
      )}
    </div>
  );
}
