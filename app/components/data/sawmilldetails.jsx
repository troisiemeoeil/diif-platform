
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import ExampleWithLocalizationProvider from "./data-tables/sawmillTable"


function Sawmilldetails() {
    return (
        <Dialog modal={false}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-[15%] absolute bottom-15 left-[45%] z-100 rounded-full border-0 bg-white text-black hover:cursor-pointer">View Sawmill Data</Button>
            </DialogTrigger>
            <DialogContent showCloseButton={false} className="min-w-[90%] h-[80%] overflow-scroll z-100 p-2 m-0 ">
                <DialogHeader  className="hidden">
                    <DialogTitle>Sawmill list of logs</DialogTitle>
                    <DialogDescription>
                        Anyone who has this link will be able to view this.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-2 z-150">
                    <div className="grid flex-1 gap-2">
                        <ExampleWithLocalizationProvider />
                    </div>
                </div>
                <DialogFooter className="sm:justify-end">
                    <DialogClose asChild>
                        <Button type="button" className="cursor-pointer " variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default Sawmilldetails
