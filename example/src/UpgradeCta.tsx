import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { CheckoutLink } from "@convex-dev/polar/react";
import { api } from "../convex/_generated/api";

export function UpgradeCTA() {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-900 dark:to-indigo-900 text-white p-4 rounded-lg shadow-md mt-8">
      <h2 className="text-xl font-semibold mb-2">Upgrade to Premium</h2>
      <p className="mb-4">Get unlimited todos, priority support, and more!</p>
      <CheckoutLink
        polarApi={api.example}
        productId="123"
        userId="456"
        email="test@test.com"
      >
        <Button
          variant="secondary"
          className="bg-white text-purple-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-purple-300 dark:hover:bg-gray-700"
        >
          Upgrade Now <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CheckoutLink>
    </div>
  );
}
