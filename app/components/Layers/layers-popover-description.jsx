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
import Image from "next/image"

export function LayersPopoverDescription({ title, imageUrl, content }) {
    return (
        <Card className="w-full ">
            <div className="w-full h-40 relative"> {/* The parent MUST have dimensions and be relative */}
                <Image
                    alt="fsv"
                    src={imageUrl}
                    fill
                    quality={100}
                    className="object-cover rounded-t-xl"
                />
            </div>
            <CardHeader className="flex flex-col">
                <CardTitle className="text-4xl font-bold">{title}</CardTitle>
                <CardDescription>
                    {content}
                </CardDescription>

            </CardHeader>
            <CardContent>

            </CardContent>

        </Card>
    )
}
