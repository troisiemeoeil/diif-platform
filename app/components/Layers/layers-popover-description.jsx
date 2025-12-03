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
export function LayersPopoverDescription({ title, imageUrl, content, legend }) {
    return (
        <Card className="w-full ">
            <div className="w-full h-40 relative">
                {imageUrl ? (
                    <img
                        alt={title}
                        src={imageUrl}
                        className="w-full h-40 object-cover rounded-t-xl"
                    />
                ) : null}
            </div>
            <CardHeader className="flex flex-col">
                <CardTitle className="text-4xl font-bold">{title}</CardTitle>
                <CardDescription>
                    {content}
                </CardDescription>
                {legend ? (
                    <img
                        alt="legend"
                        src={legend}
                        className="object-cover  mt-2"
                    />
                ) : null}
            </CardHeader>
            <CardContent>

            </CardContent>

        </Card>
    )
}


export default function StylePopoverDescription({title, legendUrl}) {
  return (
   <Card className="w-full ">
         
            <CardHeader className="flex flex-col">
                <CardTitle className="text-lg font-bold">{title}</CardTitle>
        
                {legendUrl ? (
                    <img
                        alt="legend"
                        src={legendUrl}
                        className="object-cover  mt-2"
                    />
                ) : null}
            </CardHeader>
         

        </Card>
  )
}

