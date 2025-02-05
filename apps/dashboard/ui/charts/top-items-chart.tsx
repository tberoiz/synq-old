"use client";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@refrom/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@refrom/ui/chart";

const chartData = [
  { item: "Item A", sales: 300, fill: "hsl(var(--chart-1))" },
  { item: "Item B", sales: 250, fill: "hsl(var(--chart-2))" },
  { item: "Item C", sales: 200, fill: "hsl(var(--chart-3))" },
  { item: "Item D", sales: 150, fill: "hsl(var(--chart-4))" },
  { item: "Item E", sales: 100, fill: "hsl(var(--chart-5))" },
];

const chartConfig = {
  sales: {
    label: "Sales",
  },
  "Item A": {
    label: "Item A",
    color: "hsl(var(--chart-1))",
  },
  "Item B": {
    label: "Item B",
    color: "hsl(var(--chart-2))",
  },
  "Item C": {
    label: "Item C",
    color: "hsl(var(--chart-3))",
  },
  "Item D": {
    label: "Item D",
    color: "hsl(var(--chart-4))",
  },
  "Item E": {
    label: "Item E",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function TopItemsChart() {
  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle>Top Selling Items</CardTitle>
        <CardDescription>Sales Data for January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <YAxis
              dataKey="item"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                chartConfig[value as keyof typeof chartConfig]?.label
              }
            />
            <XAxis dataKey="sales" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="sales" layout="vertical" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
