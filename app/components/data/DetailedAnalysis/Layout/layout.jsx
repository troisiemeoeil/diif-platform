import React from 'react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Lpva } from '../Lpva'

export default function Layout() {
    return (
        <Tabs defaultValue="log-product" className="w-full flex items-center p-4">
            <TabsList  className="w-full flex justify-center">
                <TabsTrigger value="log-product">LPV</TabsTrigger>
                <TabsTrigger value="stem-quality">SQM</TabsTrigger>
                <TabsTrigger value="stem-identification">SIL</TabsTrigger>
                <TabsTrigger value="stand-quality">SQTA</TabsTrigger>
                <TabsTrigger value="operational">OPA</TabsTrigger>
            </TabsList>
            <TabsContent className="w-full px-2 py-4" value="log-product">
               
                <Lpva />
            </TabsContent>
            <TabsContent className="w-full px-2 py-4" value="stem-quality">Stem Quality and Measurement Analysis.</TabsContent>
            <TabsContent className="w-full px-2 py-4" value="stem-identification">Stem Identification and Location Analysis.</TabsContent>
            <TabsContent className="w-full px-2 py-4" value="stand-quality">Stand Quality & Taper Analysis.</TabsContent>
            <TabsContent className="w-full px-2 py-4" value="operational">Operational Performance Analysis.</TabsContent>
        </Tabs>
    )
}
