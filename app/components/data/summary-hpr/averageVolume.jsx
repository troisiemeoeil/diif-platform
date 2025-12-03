"use client"

import { Bar, BarChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A stacked bar chart with a legend"



const SPECIES_LABELS = {
  "averageLogVolumeSob": "Average Log Volume Sob",
  "averageLogVolumeSub": "Average Log Volume Sub",
}

const SPECIES_COLORS = {
  "LogVolumeSub": "var(--chart-1)",
  "LogVolumeSob": "var(--chart-2)",
}


const chartConfig = {
  averageLogVolumeSob: {
    label: "Average Log Volume Sob",
    color: "var(--chart-3)",
  },
  averageLogVolumeSub: {
    label: "Average Log Volume Sub",
    color: "var(--chart-6)",
  },
}


export function AverageVolume({ stemValue }) {
  // Guard against undefined/null stemValue
  if (!stemValue) {
    return null;
  }

  const chartData = [
    {
      averageLogVolumeSob: stemValue.averageLogVolumeSob,
      averageLogVolumeSub: stemValue.averageLogVolumeSub 
    },

  ]

  return (
    <Card className="p-2">
      <CardHeader className="items-center pb-0 pt-2">
        <CardTitle>Average Log Volume</CardTitle>
        <CardDescription className="text-[12px]">Average volume measurements for logs.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData} barSize={16}>
            <XAxis hide />
            <Bar
              dataKey="averageLogVolumeSob"
              stackId="a"
              fill="var(--color-averageLogVolumeSob)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="averageLogVolumeSub"
              stackId="a"
              fill="var(--color-averageLogVolumeSub)"
              radius={[4, 4, 0, 0]}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                
                  }}
                />
              }
              cursor={false}
              defaultIndex={2}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
