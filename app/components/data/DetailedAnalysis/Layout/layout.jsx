import React from 'react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default function Layout() {
    return (
        <Tabs defaultValue="log-product" className="w-full flex items-center p-4">
            <TabsList className="flex justify-center">
                <TabsTrigger value="log-product">LPV</TabsTrigger>
                <TabsTrigger value="stem-quality">SQM</TabsTrigger>
                <TabsTrigger value="stem-identification">SIL</TabsTrigger>
                <TabsTrigger value="stand-quality">SQTA</TabsTrigger>
                <TabsTrigger value="operational">OPA</TabsTrigger>
            </TabsList>
            <TabsContent value="log-product">Log Product and Volume Analysis.</TabsContent>
            <TabsContent value="stem-quality">Stem Quality and Measurement Analysis.</TabsContent>
            <TabsContent value="stem-identification">Stem Identification and Location Analysis.</TabsContent>
            <TabsContent value="stand-quality">Stand Quality & Taper Analysis.</TabsContent>
            <TabsContent value="operational">Operational Performance Analysis.</TabsContent>
        </Tabs>
    )
}
