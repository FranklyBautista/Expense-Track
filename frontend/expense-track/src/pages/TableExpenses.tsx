import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ExpenseType } from "@/types/auth.types"
import { MoreHorizontalIcon, PencilLine, Trash2 } from "lucide-react"
import { useState } from "react"
import { EditPage } from "./EditPage"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"

const API_URL = import.meta.env.VITE_API_URL;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

function formatDate(value: string) {
  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed)
}

export function TableExpenses({expensesData, onRefresh}: {expensesData:ExpenseType[], onRefresh?: () => void | Promise<void>}) {

  const [openEdit, setOpenEdit] = useState(false)
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null)
  let suma:number=0;
  expensesData.forEach((expense) => {
    suma += Number(expense.amount);
  });



  const handleDelete = async (id: string) => {
    try{
      const res = await fetch(`${API_URL}/expenses/${id}`,{
        method:"DELETE",
        credentials:"include"
      })
      if (!res.ok) throw new Error("Delete failed")
      if (onRefresh) await onRefresh()
    }catch(err){
      console.error("Failed to delete expense:", err)
    }
  }
  return (
    <>
      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-muted/40 hover:bg-muted/40">
                <TableHead className="min-w-[220px]">Movimiento</TableHead>
                <TableHead className="min-w-[140px]">Fecha</TableHead>
                <TableHead className="min-w-[140px]">Categoría</TableHead>
                <TableHead className="min-w-[120px] text-right">Monto</TableHead>
                <TableHead className="w-[72px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expensesData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-center">
                      <p className="text-sm font-medium">Todavía no hay movimientos registrados.</p>
                      <p className="text-muted-foreground text-sm">
                        Agrega tu primer gasto para empezar a ver actividad y métricas en el dashboard.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                expensesData.map((expense) => (
                  <TableRow key={expense.id} className="transition-colors hover:bg-muted/30">
                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <p className="font-medium">{expense.title}</p>
                        <p className="text-muted-foreground line-clamp-1 text-xs">
                          {expense.info || "Sin detalle adicional"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(expense.createdAt)}</TableCell>
                    <TableCell>
                      <span className="inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                        {expense.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {currencyFormatter.format(Number(expense.amount) || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8 rounded-full">
                            <MoreHorizontalIcon />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setSelectedExpenseId(expense.id); setOpenEdit(true); }}>
                            <PencilLine className="mr-2 size-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={()=>handleDelete(expense.id)}>
                            <Trash2 className="mr-2 size-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-muted/30">
                <TableCell colSpan={3} className="font-medium">Total registrado</TableCell>
                <TableCell className="text-right text-base font-semibold">
                  {currencyFormatter.format(suma)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
      <AlertDialog open={openEdit} onOpenChange={setOpenEdit}>
        <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-lg border-none bg-transparent p-0 shadow-none">
          <AlertDialogTitle className="sr-only">Edit Expense</AlertDialogTitle>
          <AlertDialogDescription className="sr-only">Edit an existing expense</AlertDialogDescription>
          <EditPage onClose={() => setOpenEdit(false)} id={selectedExpenseId} onSaved={onRefresh} />
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
