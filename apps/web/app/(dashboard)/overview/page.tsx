import { Dialog, DialogTrigger } from "@synq/ui/dialog";
import { Package, ShoppingCart, Receipt } from "lucide-react";
import { startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@synq/ui/utils";
import { GenerateReportButton } from "@ui/features/reports/components/GenerateReportButton";

export default function OverviewPage() {
  const startDate = startOfMonth(new Date());
  const endDate = endOfMonth(new Date());

  return (
    <div className="-m-4 flex-1 flex">
      <div className="m-auto w-full max-w-4xl px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Welcome to Synq</h1>
          <p className="text-muted-foreground mt-2">
            Quick access to your most important features
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <div
                className={cn(
                  "h-24 flex flex-col items-center justify-center space-y-2 cursor-pointer",
                  "border-dashed border-2 hover:border-solid rounded-lg",
                  "bg-blue-50/50 hover:bg-blue-100/50 border-blue-200",
                  "dark:bg-blue-950/20 dark:hover:bg-blue-900/20 dark:border-blue-800",
                )}
              >
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className="text-sm">New Item</span>
              </div>
            </DialogTrigger>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <div
                className={cn(
                  "h-24 flex flex-col items-center justify-center space-y-2 cursor-pointer",
                  "border-dashed border-2 hover:border-solid rounded-lg",
                  "bg-green-50/50 hover:bg-green-100/50 border-green-200",
                  "dark:bg-green-950/20 dark:hover:bg-green-900/20 dark:border-green-800",
                )}
              >
                <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="text-sm">New Purchase</span>
              </div>
            </DialogTrigger>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <div
                className={cn(
                  "h-24 flex flex-col items-center justify-center space-y-2 cursor-pointer",
                  "border-dashed border-2 hover:border-solid rounded-lg",
                  "bg-purple-50/50 hover:bg-purple-100/50 border-purple-200",
                  "dark:bg-purple-950/20 dark:hover:bg-purple-900/20 dark:border-purple-800",
                )}
              >
                <Receipt className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <span className="text-sm">New Sale</span>
              </div>
            </DialogTrigger>
          </Dialog>

          <GenerateReportButton startDate={startDate} endDate={endDate} />
        </div>
      </div>
    </div>
  );
}
