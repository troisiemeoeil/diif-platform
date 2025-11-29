
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
import { useControlSawmillModal } from "@/lib/state/store";
import Example from "./data-tables/sawmillTable";


function Sawmilldetails() {
    const openState = useControlSawmillModal((s) => s.open)
    const setOpenState = useControlSawmillModal((s) => s.setOpenModal);


    return (
        <Dialog  open={openState} onOpenChange={setOpenState} modal={false}   >
          
            <DialogContent showCloseButton={false} className="   min-w-[70vw]  max-h-[90vh] overflow-auto z-[999] p-2 m-0">
              
                <DialogHeader  className="hidden">
                    <DialogTitle>Sawmill list of logs</DialogTitle>
                    <DialogDescription>
                        Anyone who has this link will be able to view this.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-2 z-[150]">
                    <div className="grid flex-1 gap-2">
                        <Example />
                    </div>
                </div>
                <DialogFooter className="sm:justify-end h-[10px]">
                    <DialogClose asChild>
                        <Button type="button" className="cursor-pointer" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
            
        </Dialog>
    )
}

export default Sawmilldetails
