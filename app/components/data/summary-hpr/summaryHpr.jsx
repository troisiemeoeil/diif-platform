import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { TotalNumberStem } from "./totalNumberStem"
import { AverageVolume } from "./averageVolume"
import { useAppStore } from "@/lib/state/store";
import { useEffect, useState } from "react";
import axios from "axios";
import { AverageStemLength } from "./averageStemLength";


export function SummaryHPR() {
    const country = useAppStore((s) => s.country);

    const [stemCount, setStemCount] = useState(null)
    useEffect(() => {
        if (country !== "Finland") {
            return;
        }

        let cancelled = false;

        const getData = async () => {
            try {
                const response = await axios.get("/api/stemdata/number-of-stem");
                if (!cancelled) {
                    setStemCount(response.data)

                }
            } catch (error) {
                console.error("Failed to fetch stem data", error);
            }
        };

        getData();
        return () => {
            cancelled = true;
        };
    }, [country]);


    if (country != "Finland") return null

    return (


        <Accordion
            type="single"
            collapsible
            className="relative justify-end bg-white rounded-md m-2 z-10"
        >
            <AccordionItem
                value="item-1"
                className="transition-[width] duration-300 ease-in-out w-[12vw] data-[state=open]:w-[42vw]"
            >
                <AccordionTrigger className="text-sm flex justify-between px-4 items-center font-sans font-semibold">
                    Quick Summary
                </AccordionTrigger>
                <AccordionContent className="flex w-full p-2 gap-2 text-balance">
                    {stemCount != null ? <TotalNumberStem stemValue={stemCount} /> : <div></div>}
                    <div className="flex flex-col w-[60%] gap-2">
                        <AverageVolume stemValue={stemCount} />
                        <AverageStemLength stemValue={stemCount} />

                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

