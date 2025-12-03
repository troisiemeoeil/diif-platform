
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";



export default function CsvUploader() {




    return (
        <div className='items-end'>
            <TooltipProvider>
                <Dialog>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                                <Button className='rounded-full cursor-pointer' variant="outline">
                                    <CloudUpload />
                                </Button>
                            </DialogTrigger>

                        </TooltipTrigger>

                        <TooltipContent>
                            <p>Upload Sawmill Data</p>
                        </TooltipContent>
                    </Tooltip>
                    <DialogContent className="sm:max-w-[60%] sm:max-h-[80vh]">
                        <DialogHeader>
                            <DialogTitle>Upload Sawmill Data</DialogTitle>
                        </DialogHeader>
                        <FileUpload04 />
                    </DialogContent>

                </Dialog>
            </TooltipProvider>
        </div>
    );
}
