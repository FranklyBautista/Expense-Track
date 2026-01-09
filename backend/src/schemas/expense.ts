import { z } from "zod";

export const create_expense_schema = z.object({
  title: z.string().min(1, "title is required"),
  amount: z.number().positive("amount must be greather tahn 0"),
  category: z.string().optional(),
  info: z.string().optional(),
});

export const create_modify_schema = z
  .object({
    title: z.string().min(1).optional(),
    amount: z.coerce
      .number()
      .positive("amount must be greather than 0")
      .optional(),
    category: z.string().optional(),
    info: z.string().optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one field is required",
  });

export const expenses_query_schema = z
  .object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    min_amount: z.coerce.number().positive().optional(),
    max_amount: z.coerce.number().positive().optional(),
    category: z.string().min(1).optional(),
    q: z.string().min(1).optional(),
    limit: z.coerce.number().optional(),
  })
  .refine(
    (data) => {
      if (data.from && data.to) {
        return data.from <= data.to;
      }
      return true;
    },
    {
      message: "`from` must be before or equal to `to`",
      path: ["from"],
    }
  )
  .refine(
    (data) => {
      if (data.min_amount && data.max_amount) {
        return data.min_amount <= data.max_amount;
      }
      return true;
    },
    {
      message: "`min_amount` must be less than or equal to `max_amount`",
      path: ["min_amount"],
    }
  )
  .transform((q) => {
    const where: any = {};

    if (q.from || q.to) {
      where.createdAt = {};
      if (q.from) where.createdAt.gte = q.from;
      if (q.to) where.createdAt.lte = q.to;
    }

    if (q.min_amount || q.max_amount) {
      where.amount = {};
      if (q.min_amount) where.amount.gte = q.min_amount;
      if (q.max_amount) where.amount.lte = q.max_amount;
    }

    if (q.category) where.category = q.category;

    if (q.q) {
      where.OR = [{ title: { contains: q.q } }, { info: { contains: q.q } }];
    }

    return { where, limit: q.limit };
  });
