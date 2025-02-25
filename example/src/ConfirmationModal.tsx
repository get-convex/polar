import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight } from "lucide-react";
import { ReactNode } from "react";

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  actionLabel,
  onConfirm,
  variant = "default",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  actionLabel: string;
  onConfirm: () => void;
  variant?: "default" | "destructive";
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 border-0 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            {title}
          </DialogTitle>
          <div className="text-gray-600 dark:text-gray-400 mt-2">
            {description}
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2 mt-6">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 bg-white/50 backdrop-blur-sm text-gray-600 hover:text-gray-700 hover:bg-white/80 dark:bg-white/5 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            className={`flex-1 backdrop-blur-sm ${
              variant === "destructive"
                ? "bg-red-500/90 text-white hover:bg-red-600/90 dark:bg-red-600/90 dark:hover:bg-red-700/90"
                : "bg-indigo-500/90 text-white hover:bg-indigo-600/90 dark:bg-indigo-600/90 dark:hover:bg-indigo-700/90"
            }`}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {actionLabel} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
