import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AddPage } from "./AddPage"
import React from "react"
import type { VariantProps } from "class-variance-authority"

interface ModalAddPageProps {
  onSaved?: () => void | Promise<void>;
  buttonLabel?: string;
  buttonVariant?: VariantProps<typeof buttonVariants>["variant"];
  className?: string;
}

export function ModalAddPage({
  onSaved,
  buttonLabel = "New Movement",
  buttonVariant = "outline",
  className,
}: ModalAddPageProps) {
  const [open, setOpen] = React.useState(false)

  const handleClose = () => setOpen(false)

  const handleSaved = async () => {
    setOpen(false)
    if (onSaved) await onSaved()
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={buttonVariant} className={cn(className)}>
          {buttonLabel}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-lg border-none bg-transparent p-0 shadow-none">
        <AlertDialogTitle className="sr-only">Add Expense</AlertDialogTitle>
        <AlertDialogDescription className="sr-only">
          Add a new expense to your tracker
        </AlertDialogDescription>
        <AddPage onClose={handleClose} onSaved={handleSaved} />
      </AlertDialogContent>
    </AlertDialog>
  )
}
