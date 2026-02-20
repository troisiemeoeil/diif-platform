import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { CircleQuestionMark } from "lucide-react"

function Sil() {
  return (
    <Card className="w-full py-6">
            <CardHeader className="flex  justify-center">
                <CardTitle className="text-2xl font-bold">Stem Identification and Location Analysis</CardTitle>
                 <Tooltip>
                    <TooltipTrigger>
                        <CircleQuestionMark size={15} />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Calculating the total and moving average of volume produced per species.</p>
                    </TooltipContent>
                </Tooltip>
            </CardHeader>
            <CardContent>

                <div className="flex flex-col gap-4">
                    <div className="grid gap-2">          
                    </div>
                    <div className="grid gap-2">
                    </div>
                </div>

            </CardContent>
            <CardFooter className="flex-col gap-2">
            
            </CardFooter>
        </Card>
  )
}

export default Sil
