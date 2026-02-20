import React from 'react'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Lpva } from '../Lpva'
import Sqm from '../sqm'
import Sil from '../sil'
import Sqta from '../sqta'
import Opa from '../opa'

export default function Layout() {
    return (
        <Tabs defaultValue="log-product" className="w-full flex items-center p-4">
            <TabsList className="w-full flex justify-center">
                <TabsTrigger value="log-product">LPV</TabsTrigger>
                <TabsTrigger value="stem-quality">SQM</TabsTrigger>
                <TabsTrigger value="stem-identification">SIL</TabsTrigger>
                <TabsTrigger value="stand-quality">SQTA</TabsTrigger>
                <TabsTrigger value="operational">OPA</TabsTrigger>
            </TabsList>
            <TabsContent className="w-full px-2 py-4" value="log-product">
                <Lpva />
            </TabsContent>
            <TabsContent className="w-full px-2 py-4" value="stem-quality">
                <Sqm />
            </TabsContent>
            <TabsContent className="w-full px-2 py-4" value="stem-identification"><Sil /></TabsContent>
            <TabsContent className="w-full px-2 py-4" value="stand-quality"><Sqta /></TabsContent>
            <TabsContent className="w-full px-2 py-4" value="operational"><Opa /></TabsContent>
        </Tabs>
    )
}
