
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
import { Button } from '@/components/ui/button';
import FileUpload04 from "./file-placeholder";
import { CloudUpload } from "lucide-react";



export default function CsvUploader() {




    return (
        <div className='items-end'>
            <Dialog>

                <DialogTrigger asChild>
                    <Button className='rounded-full cursor-pointer' variant="outline">
                        <CloudUpload  />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[60%] sm:max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle></DialogTitle>
                        <DialogDescription>

                        </DialogDescription>
                    </DialogHeader>
                    <FileUpload04 />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>

            </Dialog>

        </div>
    );
}
