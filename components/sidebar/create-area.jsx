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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select"

export function CreateArea() {
    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>
                    <Button variant="outline w-full">
                        <div
                            className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                            <Plus className="size-4" />
                        </div>
                        <div className="text-muted-foreground font-medium">Add New Area</div>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>New Area Details</DialogTitle>
                        <DialogDescription>
                            Make sure to fill all fields.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="name-1">Country</Label>
                            <Select>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Choose..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Available countries</SelectLabel>
                                        <SelectItem value="Finland">Finland</SelectItem>
                                        <SelectItem value="Sweden">Sweden</SelectItem>

                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-3">
                            <Label >Coordinates</Label>
                            <div className="flex gap-2 mb-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="Longtitude">Longtitude</Label>
                                    <Input id="Longtitude" name="Longtitude" />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="Latitude">Latitude</Label>
                                    <Input id="Latitude" name="Latitude" />
                                </div>

                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}
