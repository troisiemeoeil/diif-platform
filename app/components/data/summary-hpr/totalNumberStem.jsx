

import { Label, Pie, PieChart } from "recharts"

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
import { useMemo } from "react"


export const description = "A donut chart with text"

const SPECIES_LABELS = {
    "613": "Pine (Mänty)",
    "614": "Spruce (Kuusi)",
    "615": "Birch (Koivu)",
    "616": "Other broadleaves (Muut lehtipuut)",
}

const SPECIES_COLORS = {
    // Keep colors consistent with your theme palette
    "613": "var(--chart-2)", // Pine
    "614": "var(--chart-1)", // Spruce
    "615": "var(--chart-3)", // Birch
    "616": "var(--chart-5)", // Other broadleaves
}

export function TotalNumberStem({stemValue}) {
    const pieData = useMemo(() => {
        const items = Array.isArray(stemValue?.countsBySpecies)
            ? stemValue.countsBySpecies
            : []
        return items.map(({ count, groupKey }) => ({
            name: SPECIES_LABELS[groupKey] ?? String(groupKey),
            value: count,
            fill: SPECIES_COLORS[groupKey] ?? "var(--chart-4)",
        }))
    }, [stemValue])
    
    return (
        <Card className="w-full h-full flex flex-col  p-2">
            <CardHeader className="items-center pb-0 pt-2">
                <CardTitle>Total number of Stems</CardTitle>
                <CardDescription className="w-full text-[12px]">Categorized Number of Stems </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={{}}
                    className="mx-auto aspect-square h-[200px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
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
                                                    {Number(stemValue?.totalCount || 0).toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    Stems
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                  
                    </PieChart>
                
                </ChartContainer>
                          {pieData.map((item, idx) => (
                        <div key={`${item.name}-${idx}`} className="flex items-center gap-2 mt-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: item.fill }} />
                            <div className="text-xs text-muted-foreground">{item.name}</div>
                        </div>
                    ))}
            </CardContent>

        </Card>
    )
}
