"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export function TotalLogsVolume({ totalVolume }) {
  const chartConfig = {
    volume: {
      label: "Total Volume",
      color: "var(--chart-1)",
    },
  }

  return (
    <Card className="border-0  shadow-none">
      <CardHeader>
        <CardTitle>Total Logs Volume by Species</CardTitle>
      </CardHeader>

      <CardContent className="px-0  ">
        <ChartContainer config={chartConfig}>
          <BarChart data={totalVolume}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="species"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent className="gap-2" />}
            />
            <Bar
              dataKey="volume"
              fill="#4f6c40"
              radius={8}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}



