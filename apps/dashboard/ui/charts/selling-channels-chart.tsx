"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/chart";
const chartData = [
  { sellingChanel: "Channel 1", orders: 275, fill: "hsl(var(--chart-1))" },
  { sellingChanel: "Channel 2", orders: 200, fill: "hsl(var(--chart-2))" },
  { sellingChanel: "Channel 3", orders: 287, fill: "hsl(var(--chart-3))" },
  { sellingChanel: "Channel 4", orders: 173, fill: "hsl(var(--chart-4))" },
  { sellingChanel: "other", orders: 190, fill: "hsl(var(--chart-5))" },
];

const chartConfig = {
  orders: {
    label: "orders",
  },
  "Channel 1": {
    label: "Channel 1",
    color: "hsl(var(--chart-1))",
  },
  "Channel 2": {
    label: "Channel 2",
    color: "hsl(var(--chart-2))",
  },
  "Channel 3": {
    label: "Channel 3",
    color: "hsl(var(--chart-3))",
  },
  "Channel 4": {
    label: "Channel 4",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function SellingChannelsChart() {
  const totalorders = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.orders, 0);
  }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Top Selling Channels</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="orders"
              nameKey="sellingChanel"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalorders.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Orders
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
