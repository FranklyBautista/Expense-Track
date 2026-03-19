"use client"

import * as React from "react"
import {
  ChartColumnIncreasing,
  Command,
  CreditCard,
  FolderKanban,
  LifeBuoy,
  PlusCircle,
  Send,
  Wallet,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuthContext } from "@/context/auth.context"

const data = {
  navMain: [
    {
      title: "Overview",
      url: "#overview",
      icon: ChartColumnIncreasing,
      isActive: true,
      items: [
        {
          title: "Resumen",
          url: "#summary",
        },
        {
          title: "Actividad",
          url: "#activity",
        },
      ],
    },
    {
      title: "Transactions",
      url: "#transactions",
      icon: Wallet,
      items: [
        {
          title: "Todos los movimientos",
          url: "#transactions",
        },
      ],
    },
    {
      title: "Actions",
      url: "#actions",
      icon: PlusCircle,
      items: [
        {
          title: "Registrar gasto",
          url: "#actions",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Dashboard",
      url: "#overview",
      icon: FolderKanban,
    },
    {
      name: "Expenses",
      url: "#transactions",
      icon: CreditCard,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {user} = useAuthContext()

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Expense Track</span>
                  <span className="truncate text-xs">{user?.email ?? "Workspace"}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name ?? "User",
            email: user?.email ?? "user@example.com",
            avatar: "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
