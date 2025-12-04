"use client"
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useMemo } from "react";

const SPECIES_LABELS = {
    "613": "Pine ",
    "614": "Spruce ",
    "615": "Birch ",
    "616": "Other broadleaves ",
};

const SPECIES_COLORS = {
    "613": "var(--chart-2)", // Pine
    "614": "var(--chart-1)", // Spruce
    "615": "var(--chart-3)", // Birch
    "616": "var(--chart-5)", // Other broadleaves
}


export function AverageStemLength({ stemValue }) {
    console.log("stem value", stemValue);

    const barData = useMemo(() => {
        if (!stemValue || !Array.isArray(stemValue.averageStemLengthBySpecies)) return [];
        return stemValue.averageStemLengthBySpecies.map(item => ({
            name: SPECIES_LABELS[item.speciesKey] || item.speciesKey,
            Length: item.averageStemLength,
            fill: SPECIES_COLORS[item.speciesKey] ?? "var(--chart-4)",

        }));
    }, [stemValue])


    if (!stemValue) {
        // If the data object hasn't even loaded yet
        return (
            <Card className="p-2">
                <div className="h-[250px] flex items-center justify-center text-sm text-gray-500">
                    Loading Data...
                </div>
            </Card>
        );
    }

    if (!barData.length) {
        // If data is loaded but the required array is empty
        return (
            <Card className="p-2">
                <div className="h-[250px] flex items-center justify-center text-sm text-gray-500">
                    No Stem Length Data Available.
                </div>
            </Card>
        );
    }


    return (
        <Card className="p-2">
            <CardHeader className="items-center pb-0 pt-2">
                <CardTitle>Average Stem Length by Species</CardTitle>
                <CardDescription className="text-[12px]">Average stem length for each species group.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barData} barSize={32}>
                        <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
                        <YAxis tickLine={false} axisLine={false} />
                        <Tooltip formatter={(value) => value.toLocaleString(undefined, { maximumFractionDigits: 2 }) + " mm"} />
                        <Bar dataKey="Length" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
