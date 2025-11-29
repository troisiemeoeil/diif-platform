import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import CsvUploader from "../components/csv-uploader";
import { Button } from "@/components/ui/button";
import { useControlSawmillModal, useAppStore } from "@/lib/state/store";

function HeaderContent({ children }) {
  const openState = useControlSawmillModal((s) => s.open);
  const setOpenState = useControlSawmillModal((s) => s.setOpenModal);
  const setSidebarState = useAppStore((s) => s.setSidebarState);

  const { toggleSidebar, state } = useSidebar()

  function handleModalTrigger() {
    // if modal already open, do nothing
    if (openState) return;

    // collapse the sidebar only if it's currently expanded
    if (state === "expanded") {
      toggleSidebar();
      setSidebarState(false);
    }

    // open modal after collapse animation
    setTimeout(() => {
      setOpenState(true);
    }, 300);
  }
  return (
    <SidebarInset>
      <header
        className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="w-full flex items-center justify-between  gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <div className="flex w-full items-center justify-end gap-2">
            <CsvUploader />

            <Button
              variant="outline"
              onClick={handleModalTrigger}
              className="w-fit  z-20 rounded-full border-1 bg-white text-black hover:cursor-pointer">View Sawmill Data</Button>
          </div>
        </div>
      </header>

      {children}

    </SidebarInset>
  )
}

export default function Page({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <HeaderContent>{children}</HeaderContent>
    </SidebarProvider>
  );
}
