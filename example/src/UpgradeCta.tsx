import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { CheckoutLink } from "../../src/react";
import { api } from "../convex/_generated/api";

export function UpgradeCTA() {
  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900 text-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Premium</h2>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <span className="mr-2">•</span>
              Up to 50 todos
            </li>
            <li className="flex items-center">
              <span className="mr-2">•</span>
              Priority support
            </li>
            <li className="flex items-center">
              <span className="mr-2">•</span>
              Custom categories
            </li>
          </ul>
          <CheckoutLink
            polarApi={api.example}
            productId="2d368710-520b-49b0-ba7b-9c2d60d7b1c2"
          >
            <Button
              variant="secondary"
              className="w-full bg-white text-indigo-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-indigo-300 dark:hover:bg-gray-700"
            >
              Upgrade Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CheckoutLink>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 dark:from-purple-900 dark:to-indigo-900 text-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Premium Plus</h2>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <span className="mr-2">•</span>
              Unlimited todos
            </li>
            <li className="flex items-center">
              <span className="mr-2">•</span>
              24/7 priority support
            </li>
            <li className="flex items-center">
              <span className="mr-2">•</span>
              Custom categories
            </li>
            <li className="flex items-center">
              <span className="mr-2">•</span>
              Advanced analytics
            </li>
          </ul>
          <CheckoutLink
            polarApi={api.example}
            productId="premium-plus-product-id"
          >
            <Button
              variant="secondary"
              className="w-full bg-white text-purple-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-purple-300 dark:hover:bg-gray-700"
            >
              Upgrade to Plus <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CheckoutLink>
        </div>
      </div>
    </div>
  );
}
