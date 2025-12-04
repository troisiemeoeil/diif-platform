"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


export function AverageVolume({ stemValue }) {
  // Guard against undefined/null stemValue
  if (!stemValue) {
    return null;
  }


  return (
    <Card className="p-2">
      <CardHeader className="items-center pb-0 pt-2">
        <CardTitle>Average Log Volume</CardTitle>
        <CardDescription className="text-[12px]">Measurements are over and under the bark</CardDescription>
      </CardHeader>
      <CardContent>
       
          <h2 className="text-5xl text-center text-zinc-600 font-bold">{stemValue.averageLogVolumeSob.toLocaleString('en', {maximumSignificantDigits : 3})}
            <span className="text-xl align-text-top text-zinc-600 font-normal">m³</span>
          </h2>

      </CardContent>
    </Card>
  )
}
