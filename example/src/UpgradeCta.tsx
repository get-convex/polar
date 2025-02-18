import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { CheckoutLink } from "../../src/react";
import { api } from "../convex/_generated/api";

export function UpgradeCTA() {
  return (
    <div className="space-y-4 mt-8">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-900 dark:to-indigo-900 text-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Upgrade to Premium</h2>
        <p className="mb-4">Get more todos!</p>
        <CheckoutLink
          polarApi={api.example}
          productId="2d368710-520b-49b0-ba7b-9c2d60d7b1c2"
        >
          <Button
            variant="secondary"
            className="bg-white text-purple-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-purple-300 dark:hover:bg-gray-700"
          >
            Upgrade Now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CheckoutLink>
      </div>

      <div className="bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-800 dark:to-orange-900 text-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Upgrade to Premium Plus</h2>
        <p className="mb-4">Get even more todos!</p>
        <CheckoutLink
          polarApi={api.example}
          productId="premium-plus-product-id"
        >
          <Button
            variant="secondary"
            className="bg-white text-orange-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-orange-300 dark:hover:bg-gray-700"
          >
            Upgrade to Plus <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CheckoutLink>
      </div>
    </div>
  );
}
