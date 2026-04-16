import { AppSidebar } from "@/app/components/sidebar/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import CsvUploader from "../csv-uploader";
import { Button } from "@/components/ui/button";
import { useControlSawmillModal, useAppStore } from "@/lib/state/store";
import { AudioWaveform, Axe, ChartLine, ChartNoAxesCombined, Database, GalleryVerticalEnd, Home, Layers } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TeamSwitcher } from "@/app/components/sidebar/team-switcher";
import Link from "next/link";
import { usePathname } from "next/navigation";

const data = {

  teams: [
    {
      name: "DIIF (FIN)",
      logo: GalleryVerticalEnd,
      plan: "Finland",
    },
    {
      name: "DIIF (SWE)",
      logo: AudioWaveform,
      plan: "Sweden",
    },

  ],
}
function HeaderContent({ children }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const openState = useControlSawmillModal((s) => s.open);
  const setOpenState = useControlSawmillModal((s) => s.setOpenModal);
  const setSidebarState = useAppStore((s) => s.setSidebarState);
  const selectedMenu = useAppStore((s) => s.selectedMenu);
  const setselectedMenu = useAppStore((s) => s.setselectedMenu);
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

  function handleMenuItemSideBar(menu) {
    // collapse the sidebar only if it's currently expanded
    setselectedMenu(menu)

    if (state === "collapsed" && menu === menu) {
      toggleSidebar();
      setSidebarState(true);
    }


  }
  return (
    <SidebarInset>
      <header
        className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="w-full flex items-center justify-between  gap-2 px-4">
          <SidebarTrigger className="-ml-1" disabled={!isHomePage} />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          {isHomePage && <TeamSwitcher teams={data.teams} /> }
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild className="cursor-pointer">
                <Link href="/">
                  <Home />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Map View
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => handleMenuItemSideBar("Layers")}
                disabled={!isHomePage}
                className="cursor-pointer"><Layers /></Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Map Layers</p>
            </TooltipContent>
          </Tooltip>

             <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild className="cursor-pointer">
                <Link href="/metsa-intelligence">
                  <ChartNoAxesCombined />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Analyze data
            </TooltipContent>
          </Tooltip>

          <div className="flex w-full items-center justify-end gap-2">
            {isHomePage && <CsvUploader />}
            {isHomePage && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={handleModalTrigger}
                    className="z-20 rounded-full  border-1 bg-white text-black hover:cursor-pointer"><Axe /></Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open Sawmill Data</p>
                </TooltipContent>
              </Tooltip>
            )}

          </div>
        </div>
      </header>

      {children}

    </SidebarInset>
  )
}

export default function Page({ children }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <HeaderContent>{children}</HeaderContent>
    </SidebarProvider>
  );
}
