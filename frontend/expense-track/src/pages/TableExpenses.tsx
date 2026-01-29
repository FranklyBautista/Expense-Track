import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ExpenseType } from "@/types/auth.types"
import { MoreHorizontalIcon } from "lucide-react"
import { useState } from "react"
import { EditPage } from "./EditPage"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"

const API_URL = import.meta.env.VITE_API_URL;

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
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Title</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expensesData.map((expense) => (
          <TableRow key={expense.id}>
            <TableCell className="font-medium">{expense.title}</TableCell>
            <TableCell>{expense.createdAt}</TableCell>
            <TableCell>{expense.category}</TableCell>
            <TableCell>${expense.amount}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontalIcon />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setSelectedExpenseId(expense.id); setOpenEdit(true); }}>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={()=>handleDelete(expense.id)}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={4}>Total</TableCell>
          <TableCell className="text-right">{suma.toFixed(2)}</TableCell>
        </TableRow>
      </TableFooter>
      {/* Edit dialog */}
      <AlertDialog open={openEdit} onOpenChange={setOpenEdit}>
        <AlertDialogContent className="p-0 w-fit max-w-md border-none">
          <AlertDialogTitle className="sr-only">Edit Expense</AlertDialogTitle>
          <AlertDialogDescription className="sr-only">Edit an existing expense</AlertDialogDescription>
          <EditPage onClose={() => setOpenEdit(false)} id={selectedExpenseId} onSaved={onRefresh} />
        </AlertDialogContent>
      </AlertDialog>
    </Table>
  )
}
