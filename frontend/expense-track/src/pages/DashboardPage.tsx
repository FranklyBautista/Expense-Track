import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAuthContext } from "@/context/auth.context"
import type { ExpenseType } from "@/types/auth.types"
import {
  ArrowRight,
  ChartColumnIncreasing,
  CircleDollarSign,
  CreditCard,
  ReceiptText,
  Sparkles,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { ModalAddPage } from "./ModalAddPage"
import { TableExpenses } from "./TableExpenses"

const API_URL = import.meta.env.VITE_API_URL

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

function formatMoney(value: number) {
  return currencyFormatter.format(value)
}

function getGreeting(name?: string) {
  if (!name) return "Welcome back"
  return `Hola, ${name}`
}

function formatDate(value: string) {
  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return "Fecha no disponible"
  }

  return new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed)
}

export default function DashboardPage() {
  const { user } = useAuthContext()
  const [expenses, setExpenses] = useState<ExpenseType[]>([])

  useEffect(() => {
    async function getData() {
      try {
        const resData = await fetch(`${API_URL}/expenses`, {
          method: "GET",
          credentials: "include",
        })

        const data = await resData.json().catch(() => ({}))

        if (!resData.ok) {
          throw new Error(data.error || data.message || "Fetch Failed")
        }

        setExpenses(data.data)
      } catch (err: any) {
        alert(err.message || "Error al obtener los datos")
      }
    }

    getData()
  }, [])

  async function refreshExpenses() {
    try {
      const resData = await fetch(`${API_URL}/expenses/`, {
        method: "GET",
        credentials: "include",
      })

      const data = await resData.json().catch(() => ({}))

      if (!resData.ok) {
        throw new Error(data.error || data.message || "Fetch Failed")
      }

      setExpenses(data.data)
    } catch (err: any) {
      console.error("Refresh failed:", err)
    }
  }

  const stats = useMemo(() => {
    const totalAmount = expenses.reduce((acc, expense) => acc + (Number(expense.amount) || 0), 0)
    const averageAmount = expenses.length ? totalAmount / expenses.length : 0

    const categoryTotals = expenses.reduce<Record<string, number>>((acc, expense) => {
      const key = expense.category?.trim() || "Sin categoría"
      acc[key] = (acc[key] || 0) + (Number(expense.amount) || 0)
      return acc
    }, {})

    const topCategories = Object.entries(categoryTotals)
      .sort(([, amountA], [, amountB]) => amountB - amountA)
      .slice(0, 3)

    const latestExpense = [...expenses]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

    return {
      totalAmount,
      averageAmount,
      transactionCount: expenses.length,
      topCategories,
      latestExpense,
    }
  }, [expenses])

  const userInitials = user?.name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "ET"

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-muted/30">
        <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="hidden h-4 md:block"
              />
              <div>
                <p className="text-sm font-medium">Expense Track</p>
                <p className="text-muted-foreground text-xs">Dashboard principal</p>
              </div>
            </div>
            <ModeToggle />
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6">
          <section
            id="overview"
            className="overflow-hidden rounded-[28px] border bg-background shadow-sm"
          >
            <div className="grid gap-6 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.04),transparent_55%)] px-5 py-6 md:px-8 md:py-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)] lg:items-end">
              <div className="space-y-6">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                  <Sparkles className="size-3.5" />
                  Vista general de tus gastos
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-11 border">
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                        {getGreeting(user?.name)}
                      </h1>
                      <p className="text-muted-foreground text-sm md:text-base">
                        Monitorea tus movimientos, detecta patrones y mantén tu registro al día.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  id="summary"
                  className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
                >
                  <SummaryCard
                    title="Total registrado"
                    value={formatMoney(stats.totalAmount)}
                    description="Suma acumulada de todos tus movimientos."
                    icon={CircleDollarSign}
                  />
                  <SummaryCard
                    title="Movimientos"
                    value={String(stats.transactionCount)}
                    description="Cantidad total de registros cargados."
                    icon={ReceiptText}
                  />
                  <SummaryCard
                    title="Promedio"
                    value={formatMoney(stats.averageAmount)}
                    description="Monto medio por transacción."
                    icon={ChartColumnIncreasing}
                  />
                </div>
              </div>

              <Card
                id="actions"
                className="gap-4 border-border/70 bg-card/95 py-5 shadow-none backdrop-blur"
              >
                <CardHeader className="px-5 pb-0">
                  <CardTitle className="text-lg">Acciones rápidas</CardTitle>
                  <CardDescription>
                    Registra movimientos y revisa el estado actual de tu cuenta sin salir del dashboard.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-5">
                  <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                    <ModalAddPage
                      onSaved={refreshExpenses}
                      buttonLabel="Nuevo movimiento"
                      buttonVariant="default"
                      className="w-full justify-center"
                    />
                    <Button variant="secondary" className="justify-between" asChild>
                      <a href="#transactions">
                        Ver movimientos
                        <ArrowRight className="size-4" />
                      </a>
                    </Button>
                  </div>

                  <div className="grid gap-3">
                    <MiniInsight
                      label="Último movimiento"
                      value={stats.latestExpense?.title || "Sin registros todavía"}
                      helper={
                        stats.latestExpense
                          ? `${formatMoney(Number(stats.latestExpense.amount) || 0)} · ${formatDate(stats.latestExpense.createdAt)}`
                          : "Agrega un gasto para empezar"
                      }
                    />
                    <MiniInsight
                      label="Categoría principal"
                      value={stats.topCategories[0]?.[0] || "Sin categoría"}
                      helper={
                        stats.topCategories[0]
                          ? `${formatMoney(stats.topCategories[0][1])} acumulados`
                          : "Aún no hay suficientes datos"
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
            <Card id="transactions" className="gap-0 overflow-hidden py-0 shadow-sm">
              <CardHeader className="border-b px-5 py-5 md:px-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">Movimientos recientes</CardTitle>
                    <CardDescription>
                      Historial completo de gastos con acceso rápido a edición y eliminación.
                    </CardDescription>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {stats.transactionCount} registros totales
                  </p>
                </div>
              </CardHeader>
              <CardContent className="px-0 py-0">
                <TableExpenses expensesData={expenses} onRefresh={refreshExpenses} />
              </CardContent>
            </Card>

            <div id="activity" className="grid gap-6">
              <Card className="py-5 shadow-sm">
                <CardHeader className="px-5 pb-0">
                  <CardTitle className="text-lg">Distribución destacada</CardTitle>
                  <CardDescription>
                    Tus categorías con mayor impacto dentro del total registrado.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-5">
                  <div className="space-y-4">
                    {stats.topCategories.length > 0 ? (
                      stats.topCategories.map(([category, amount], index) => {
                        const percentage = stats.totalAmount > 0 ? (amount / stats.totalAmount) * 100 : 0

                        return (
                          <div key={category} className="space-y-2">
                            <div className="flex items-center justify-between gap-4">
                              <div className="space-y-1">
                                <p className="text-sm font-medium">
                                  {index + 1}. {category}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {percentage.toFixed(1)}% del total
                                </p>
                              </div>
                              <p className="text-sm font-semibold">{formatMoney(amount)}</p>
                            </div>
                            <div className="h-2 rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-foreground/80"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <EmptyPanel
                        title="Sin categorías para mostrar"
                        description="Cuando registres gastos, aquí verás qué categorías pesan más en tu presupuesto."
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="py-5 shadow-sm">
                <CardHeader className="px-5 pb-0">
                  <CardTitle className="text-lg">Estado del registro</CardTitle>
                  <CardDescription>
                    Un resumen simple para saber cómo viene tu panel hoy.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-5">
                  <div className="grid gap-3">
                    <StatusRow
                      icon={CreditCard}
                      label="Movimientos cargados"
                      value={String(stats.transactionCount)}
                    />
                    <StatusRow
                      icon={CircleDollarSign}
                      label="Gasto acumulado"
                      value={formatMoney(stats.totalAmount)}
                    />
                    <StatusRow
                      icon={ChartColumnIncreasing}
                      label="Ticket promedio"
                      value={formatMoney(stats.averageAmount)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string
  value: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className="gap-4 border-border/70 bg-background/90 py-5 shadow-none backdrop-blur">
      <CardHeader className="px-5 pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardDescription>{title}</CardDescription>
            <CardTitle className="text-2xl tracking-tight">{value}</CardTitle>
          </div>
          <div className="rounded-2xl border bg-muted/60 p-2.5">
            <Icon className="size-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pt-0">
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  )
}

function MiniInsight({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="rounded-2xl border bg-muted/30 p-4">
      <p className="text-muted-foreground text-xs uppercase tracking-[0.16em]">{label}</p>
      <p className="mt-2 font-medium">{value}</p>
      <p className="text-muted-foreground mt-1 text-sm">{helper}</p>
    </div>
  )
}

function StatusRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border bg-muted/25 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="rounded-xl border bg-background p-2">
          <Icon className="size-4" />
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  )
}

function EmptyPanel({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-dashed bg-muted/20 p-5 text-center">
      <p className="font-medium">{title}</p>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
    </div>
  )
}
