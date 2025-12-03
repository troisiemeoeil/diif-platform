"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A line chart"

const chartData = [
  { month: "Item 1", volume: 0.1032 },
  { month: "Item 2", volume: 0.1049 },
  { month: "Item 3", volume: 0.1057 },
  { month: "Item 4", volume: 0.1024 },
  { month: "Item 5", volume: 0.1041 },
  { month: "Item 6", volume: 0.1038 },
  { month: "Item 7", volume: 0.1063 },
  { month: "Item 8", volume: 0.1029 },
  { month: "Item 9", volume: 0.1035 },
  { month: "Item 10", volume: 0.1047 },
  { month: "Item 11", volume: 0.1051 },
  { month: "Item 12", volume: 0.1030 },
  { month: "Item 13", volume: 0.1044 },
  { month: "Item 14", volume: 0.1027 },
  { month: "Item 15", volume: 0.1054 },
  { month: "Item 16", volume: 0.1042 },
  { month: "Item 17", volume: 0.1033 },
  { month: "Item 18", volume: 0.1058 },
  { month: "Item 19", volume: 0.1046 },
  { month: "Item 20", volume: 0.1037 },
]

const chartConfig = {
  volume: {
    label: "Volume",
    color: "var(--chart-1)",
  },
} 

export function AverageVolume() {
  return (
    <Card className="w-full p-2">
      <CardHeader className="pb-0 pt-2">
        <CardTitle>Average Stem Volume</CardTitle>
        <CardDescription>Calculate average volume of havrvested stems</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
         
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="volume"
              type="natural"
              stroke="var(--color-volume)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
 
    </Card>
  )
}
