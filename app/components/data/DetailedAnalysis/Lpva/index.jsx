import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from "axios"
import { useEffect, useState } from "react"
import { TotalLogsVolume } from "./totalLogsVolumePerSpecies"
import { LogVolumePerStem } from "./LogVolumePerStem"
export function Lpva() {
    const [totalVolume, setTotalVolume] = useState(null)
    useEffect(() => {
        const getData = async () => {
            try {
                const response = await axios.get("/api/harvesting-analysis/lpva");

                const totalVolumeMap = response.data.map(item => ({
                    species: item.speciesName,
                    volume: item.totalSpeciesVolume,
                }));

                setTotalVolume(totalVolumeMap)

            } catch (error) {
                console.error("Failed to fetch stem data", error);
            }
        };

        getData();
    }, [])
    return (
        <Card className="w-full py-6">
            <CardHeader className="flex  justify-center">
                <CardTitle className="text-2xl font-bold"> Log Product and Volume Analysis.</CardTitle>

            </CardHeader>
            <CardContent>

                <div className="flex flex-col gap-4">
                    <div className="grid gap-2">
                        {
                            totalVolume && (

                                <TotalLogsVolume totalVolume={totalVolume} />
                            )
                        }
                    </div>
                    <div className="grid gap-2">
                        <LogVolumePerStem />

                    </div>
                </div>

            </CardContent>
            <CardFooter className="flex-col gap-2">
            
            </CardFooter>
        </Card>
    )
}
