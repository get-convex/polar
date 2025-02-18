import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Star } from "lucide-react";
import { CheckoutLink } from "../../src/react";
import { api } from "../convex/_generated/api";
import { useQuery } from "convex/react";

export function UpgradeCTA() {
  const user = useQuery(api.example.getCurrentUser);

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className={`relative bg-gradient-to-br ${
            user?.isPremium
              ? "from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 ring-2 ring-indigo-300 dark:ring-indigo-700"
              : "from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900"
          } text-white p-6 rounded-lg shadow-md`}
        >
          {user?.isPremium && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Star className="w-3 h-3" /> Current Plan
            </div>
          )}
          <h2
            className={`text-xl font-semibold mb-4 ${
              user?.isPremium
                ? "text-indigo-700 dark:text-indigo-300"
                : "text-white"
            }`}
          >
            Premium
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
          {!user?.isPremium && (
            <CheckoutLink
              polarApi={api.example}
              productId="2d368710-520b-49b0-ba7b-9c2d60d7b1c2"
            >
              <Button
                variant="secondary"
                className="w-full bg-white text-indigo-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-indigo-300 dark:hover:bg-gray-700"
              >
                Upgrade to Premium <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CheckoutLink>
          )}
        </div>

        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-900 dark:via-purple-900 dark:to-indigo-900 text-white p-6 rounded-lg shadow-xl ring-2 ring-purple-300 dark:ring-purple-700">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-medium">
            Most Popular
          </div>
          <h2 className="text-xl font-semibold mb-4">Premium Plus</h2>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2 flex-shrink-0 text-purple-200" />
              All the todos you can todo
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2 flex-shrink-0 text-purple-200" />
              24/7 support (3-5 day response time 🙌)
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2 flex-shrink-0 text-purple-200" />
              Todo Inc. will steal less of your data**
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2 flex-shrink-0 text-purple-200" />
              Advanced analytics (for us)
            </li>
          </ul>
          <CheckoutLink
            polarApi={api.example}
            productId="premium-plus-product-id"
          >
            <Button
              variant="secondary"
              className="w-full bg-white/95 backdrop-blur-sm text-purple-700 hover:bg-white dark:bg-white/10 dark:text-purple-200 dark:hover:bg-white/20"
            >
              Upgrade to Premium Plus <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CheckoutLink>
        </div>
      </div>
    </div>
  );
}
