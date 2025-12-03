import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { TotalNumberStem } from "./totalNumberStem"
import { AverageVolume } from "./averageVolume"


export function SummaryHPR() {
    return (
        <Accordion
            type="single"
            collapsible
            // Remove the transition from here
            className="relative justify-end bg-white rounded-md m-2 z-10"
        >
            <AccordionItem
                value="item-1"

                className="
            transition-[width] duration-300 ease-in-out
            w-[12vw] 
            data-[state=open]:w-[35vw] 
        "
            >
                <AccordionTrigger className="text-sm flex justify-between px-4 items-center font-sans font-semibold">
                    Quick Summary
                </AccordionTrigger>
                <AccordionContent className="flex w-full p-2 gap-2 text-balance">
                    <TotalNumberStem />
                    <div className="flex flex-col w-full gap-2">
                        <AverageVolume />
                        <AverageVolume />
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

