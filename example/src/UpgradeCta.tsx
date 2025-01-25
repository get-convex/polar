import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function UpgradeCTA() {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-4 rounded-lg shadow-md mt-8">
      <h2 className="text-xl font-semibold mb-2">Upgrade to Premium</h2>
      <p className="mb-4">Get unlimited todos, priority support, and more!</p>
      <Button
        variant="secondary"
        className="bg-white text-purple-700 hover:bg-gray-100"
      >
        Upgrade Now <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
