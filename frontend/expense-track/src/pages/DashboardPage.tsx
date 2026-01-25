import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAuthContext } from "@/context/auth.context"
import { ModeToggle } from "@/components/mode-toggle"
import { useEffect, useState } from "react"
import type { ExpenseType } from "@/types/auth.types"

const API_URL = import.meta.env.VITE_API_URL;



export default function DashboardPage() {

  
  const { user } = useAuthContext()

  const [expenses, setExpenses]= useState<ExpenseType[]>([])

  useEffect(() => {

    async function getData() {
      try {
        const resData = await fetch(`${API_URL}/expenses/get`, {
          method: "GET",
          credentials: "include",
        });

        const data = await resData.json().catch(() => ({}))

        if (!resData.ok) {
          throw new Error(data.error || data.message || "Fetch Failed")
        }
        console.log(data)
        setExpenses(data.gastos)
        
      } catch (err: any) {
        alert(err.message || "Error al obtener los datos")
      }
    }
    getData();
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/*<div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
          </div>*/}
          <div>
            <h2>hola {user?.name}</h2>
            <ModeToggle />
            <div>
              <p>DASHBOARD CONTENT GOES HERE</p>
              {expenses.map((expense)=>{
                return (<div key={expense.id}>
                  <p>{expense.title} - ${expense.amount}</p>
                </div>
                )
              })}
            </div>
          </div>
          { /*  <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />*/}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}