import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { AddPage } from "./AddPage"
import React from "react"

export function ModalAddPage() {
  const [open, setOpen] = React.useState(false)

  const handleClose = () => setOpen(false)

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">New Movement</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="p-0 w-fit max-w-md border-none">
        <AlertDialogTitle className="sr-only">Add Expense</AlertDialogTitle>
        <AlertDialogDescription className="sr-only">
          Add a new expense to your tracker
        </AlertDialogDescription>
        <AddPage onClose={handleClose}/>
      </AlertDialogContent>
    </AlertDialog>
  )
}
