"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/chart"
const chartData = [
  { inventory: "Inventory A", sales: 275, fill: "hsl(var(--chart-1))" },
  { inventory: "Inventory B", sales: 200, fill: "hsl(var(--chart-2))" },
  { inventory: "Inventory C", sales: 187, fill: "hsl(var(--chart-3))" },
  { inventory: "Inventory D", sales: 173, fill: "hsl(var(--chart-4))" },
  { inventory: "Inventory E", sales: 90, fill: "hsl(var(--chart-5))" },
]

const chartConfig = {
  sales: {
    label: "sales",
  },
  "Inventory A": {
    label: "Inventory A ",
    color: "hsl(var(--chart-1))",
  },
  "Inventory B": {
    label: "Inventory B ",
    color: "hsl(var(--chart-2))",
  },
  "Inventory C": {
    label: "Inventory C ",
    color: "hsl(var(--chart-3))",
  },
  "Inventory D": {
    label: "Inventory D ",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export function InventoryPerformanceChart() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Top Inventories</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="sales" label nameKey="inventory" />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total sales for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}
