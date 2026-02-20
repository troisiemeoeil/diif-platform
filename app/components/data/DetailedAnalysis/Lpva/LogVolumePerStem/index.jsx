"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

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

export function LogVolumePerStem() {
    const [data, setData] = React.useState([])
    const [activeSpecies, setActiveSpecies] = React.useState("")
    console.log(activeSpecies);

    // 1. Fetch data from your API
    React.useEffect(() => {
        async function fetchData() {
            const response = await fetch("/api/harvesting-analysis/lpva")
            const result = await response.json()
            setData(result)
            if (result.length > 0) {
                setActiveSpecies(result[0].speciesKey)
            }
        }
        fetchData()
    }, [])

    const chartData = React.useMemo(() => {
        const selectedGroup = data.find((g) => g.speciesKey === activeSpecies);
        if (!selectedGroup) return [];

        if (activeSpecies === "614") {
            return selectedGroup.averagedBuckets.map((bucket) => ({
                label: `Group ${bucket._id + 1}`,
                volume: bucket.averageVolume,
            }));
        }

        return selectedGroup.stems.map((stem, index) => ({
            label: index + 1,
            volume: stem.volumeSob,
        }));
    }, [data, activeSpecies]);

    const chartConfig = React.useMemo(() => {
        const config = {
            volume: { label: "Volume (Sob)" },
        }
        data.forEach((group, index) => {
            config[group.speciesKey] = {
                label: group.speciesName,
                color: `var(--chart-${(index % 5) + 1})`,
            }
        })
        return config
    }, [data])

    if (data.length === 0) return <div>Loading harvest data...</div>

    return (
        <Card className="py-4 sm:py-0 border-0 shadow-transparent">
            <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
                    <CardTitle>Stem Volume Analysis</CardTitle>
                </div>
                <div className="flex overflow-x-auto">
                    {data.map((group) => (
                        <button
                            type="button"
                            key={group.speciesKey}
                            data-active={activeSpecies === group.speciesKey}
                            className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                            onClick={() => setActiveSpecies(group.speciesKey)}
                        >
                            <span className="text-muted-foreground text-xs whitespace-nowrap">
                                {group.speciesName}
                            </span>
                            <span className="text-lg leading-none font-bold sm:text-3xl">
                                {group.totalSpeciesVolume.toFixed(2)}
                            </span>
                        </button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6 b-0">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[300px] w-full"
                >
                    <LineChart
                        data={chartData}
                        margin={{ left: 12, right: 12, top: 20 }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => val.toFixed(2)}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[180px]"
                                    labelFormatter={(value) => `Stem Sequence: ${value}`}
                                />
                            }
                        />
                        <Line
                            dataKey="volume"
                            type="monotone"
                            stroke={chartConfig[activeSpecies]?.color || "var(--chart-1)"}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ChartContainer>
                <CardDescription className="flex justify-end pt-5 text-xs">
                    {activeSpecies === "614"
                        ? "Showing average volume for every 100 spruce stems."
                        : "Individual log volumes grouped by tree species."}
                </CardDescription>

            </CardContent>
        </Card>
    )
}