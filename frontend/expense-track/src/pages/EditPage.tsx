import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React from "react"
import { Field, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

const API_URL = import.meta.env.VITE_API_URL

interface AddPageProps {
    onClose?: () => void;
    id?: string | null;
}

const styles = `
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  input[type="number"] {
    -moz-appearance: textfield;
  }
`

export function EditPage({ onClose, id }: AddPageProps) {
    const [title, setTitle] = React.useState("");
    const [amount, setAmount] = React.useState<number | string>("");
    const [category, setCategory] = React.useState("");
    const [info, setInfo] = React.useState("");

    React.useEffect(() => {
        if (!id) {
            setTitle("");
            setAmount("");
            setCategory("");
            setInfo("");
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`${API_URL}/expenses/${id}`, { credentials: "include", method:"GET" });
                const data = await res.json().catch(() => ({}));
                if (res.ok && !cancelled && data.specificExpense) {
                    const expense = data.specificExpense;
                    setTitle(expense.title || "");
                    setAmount(expense.amount ?? "");
                    setCategory(expense.category || "");
                    setInfo(expense.info || "");
                }
                console.log(data);
                
            } catch (err) {
                console.error("Failed to load expense:", err);
            }
        })();
        return () => { cancelled = true };
    }, [id]);

    async function addExpense() {
        try {
            console.log(title, amount, category, info);
            const url = id ? `${API_URL}/expenses/${id}` : `${API_URL}/expenses/create`;
            const method = id ? "PATCH" : "POST";
            const res = await fetch(url, {
                method,
                credentials: "include",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ title, amount, category, info })
            })

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data.error || data.message || "Error al agregar el gasto")
            }

            alert(id ? "Gasto actualizado exitosamente" : "Gasto agregado exitosamente")


        } catch (err: any) {
            alert(err.message || "Error al agregar el gasto")
        }
    }



    return (
        <>
            <style>{styles}</style>
            <Card className="w-100 max-w-sm border-none shadow-lg">
            <CardHeader>
                <CardTitle>{id ? "Edit Transaction" : "Add Transaction"}</CardTitle>
                <CardDescription>
                    Agrega una nueva transaccion a tu registro
                </CardDescription>
                <CardAction>
                    <Button onClick={onClose} variant="ghost">X</Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                <form>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                type="text"
                                placeholder="Comida, Transporte, etc"
                                required
                                value={title}
                                onChange={(e) => { setTitle(e.target.value) }}
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="amount">Amount</Label>
                                <a
                                    href="#"
                                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                >
                                    USD
                                </a>
                            </div>
                            <Input 
                                id="amount" 
                                type="number"
                                required 
                                value={amount} 
                                onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))} 
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Input
                                id="category"
                                type="text"
                                placeholder="Comida, Transporte, etc"
                                required
                                value={category}
                                onChange={(e) => { setCategory(e.target.value) }}
                            />
                        </div>
                        <Field data-disabled>
                            <FieldLabel htmlFor="textarea-disabled">Message</FieldLabel>
                            <Textarea
                                id="textarea-disabled"
                                placeholder="Type your message here."
                                value={info}
                                onChange={(e)=> setInfo(e.target.value)}
                            />
                        </Field>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button type="submit" className="w-full" onClick={addExpense}>
                    {id ? "Update" : "Save"}
                </Button>

            </CardFooter>
        </Card>
        </>
    )
}
