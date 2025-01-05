import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/card";
import { SellingChannelsChart } from "@ui/charts/selling-channels-chart";
import { InventoryPerformanceChart } from "@ui/charts/inventory-performance-chart";
import { OverviewChart } from "@ui/charts/total-revenue-chart";
import { TopItemsChart } from "@ui/charts/top-items-chart";
import { Gauge } from "lucide-react";
import { StockChart } from "@ui/charts/stock-chart";

export default function OverviewPage() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        <OverviewChart />
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-medium">Performance</CardTitle>
          <Gauge size={16} />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <TopItemsChart />
            <InventoryPerformanceChart />
            <SellingChannelsChart />
            <StockChart />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
