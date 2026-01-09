import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import prisma from "../db";
import {
  expenses_query_schema,
  create_expense_schema,
  create_modify_schema,
} from "../schemas/expense";

export async function list(req: AuthRequest, res: Response) {
  const dataFilterZod = expenses_query_schema.parse(req.query);

  const gastos = await prisma.expense.findMany({
    where: { userId: req.userId, ...dataFilterZod.where },

    take: dataFilterZod.limit ? dataFilterZod.limit : undefined,
  });
  if (gastos.length == 0)
    return res.json({ message: "No hay gastos registrados aun" });

  res.status(200).json({ message: "Datos obtenidos exitosamentes", gastos });
}

export async function create(req: AuthRequest, res: Response) {
  const dataZod = create_expense_schema.parse(req.body);

  const newExpense = await prisma.expense.create({
    data: {
      title: dataZod.title,
      amount: dataZod.amount,
      info: dataZod.info,
      category: dataZod.category,
      user: {
        connect: { id: req.userId },
      },
    },
  });

  res.status(201).json({ message: "Expense Created", newExpense });
}

export async function remove(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const deletes = await prisma.expense.deleteMany({
    where: { id, userId: req.userId },
  });

  if (deletes.count == 0)
    return res.status(404).json({ message: "Gasto no encontrado" });

  res.status(201).json({ mesage: "Gasto eliminado exitosamente" });
}

export async function update(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const dataZod = create_modify_schema.parse(req.body);

  // 1) Verificar que el expense sea de usuario
  const existingExpense = await prisma.expense.findFirst({
    where: { id, userId: req.userId },
    select: { id: true },
  });

  if (!existingExpense)
    return res.status(404).json({ message: "No se ha encontrado el gasto" });

  const updated = await prisma.expense.update({
    where: { id },
    data: {
      title: dataZod.title,
      amount: dataZod.amount,
      category: dataZod.category,
      info: dataZod.info,
    },
  });

  res.json(updated);
}

export async function getOne(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const specificExpense = await prisma.expense.findFirst({
    where: { id, userId: req.userId },
  });

  if (!specificExpense)
    return res.status(404).json({ message: "No se ha encontrado el gasto" });

  return res.status(200).json({ specificExpense });
}
