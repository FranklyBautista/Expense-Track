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
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({ data: gastos });
}

export async function create(req: AuthRequest, res: Response) {
  const dataZod = create_expense_schema.parse(req.body);

  const newExpense = await prisma.expense.create({
    data: {
      title: dataZod.title,
      amount: dataZod.amount,
      info: dataZod.info,
      category: dataZod.category,
      user: { connect: { id: req.userId } },
    },
  });

  return res.status(201).json({
    data: newExpense,
    message: "Expense created",
  });
}

export async function remove(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const deletes = await prisma.expense.deleteMany({
    where: { id, userId: req.userId },
  });

  if (deletes.count === 0) {
    return res.status(404).json({ error: "Expense not found" });
  }

  return res.status(204).send();
}

export async function update(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const dataZod = create_modify_schema.parse(req.body);

  // Verificar ownership
  const existingExpense = await prisma.expense.findFirst({
    where: { id, userId: req.userId },
    select: { id: true },
  });

  if (!existingExpense) {
    return res.status(404).json({ error: "Expense not found" });
  }

  const updated = await prisma.expense.update({
    where: { id },
    data: {
      title: dataZod.title,
      amount: dataZod.amount,
      category: dataZod.category,
      info: dataZod.info,
    },
  });

  return res.status(200).json({
    data: updated,
    message: "Expense updated",
  });
}

export async function getOne(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const specificExpense = await prisma.expense.findFirst({
    where: { id, userId: req.userId },
  });

  if (!specificExpense) {
    return res.status(404).json({ error: "Expense not found" });
  }

  return res.status(200).json({ data: specificExpense });
}
