import "dotenv/config";
import express from "express";
import cors from "cors";
import prisma from "./db";
import bycrypt from "bcrypt";
import cookieParser from "cookie-parser";
import { requireAuth, AuthRequest } from "./middlewares/auth";
import { errorHandler } from "./middlewares/errorHandler";
import { asyncHandler } from "./middlewares/asyncHandler";

import { hashear_password } from "./utils/hash";
import { signAccesToken } from "./utils/jwt";
import {
  create_expense_schema,
  expenses_query_schema,
  create_modify_schema,
} from "./schemas/expense";

import { login_user_schema, register_user_schema } from "./schemas/user";
import { ZodError } from "zod";
import { title } from "node:process";
import { error } from "node:console";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.send("HELLO WORLD");
});

app.post(
  "/auth/register",
  asyncHandler(async (req, res) => {
    const dataZod = register_user_schema.parse(req.body);

    //Valido que los datos esten completos

    //Si no faltan datos procedo a ver si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: dataZod.email },
    });
    if (existingUser) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }
    //Si el usuario no existe, procedo a crearlo e implementarlo dentro de la base de datos

    //Hasheo la password antes de guardarla
    const hashedPassword = await hashear_password(dataZod.pasword);

    const newUser = await prisma.user.create({
      data: {
        name: dataZod.name,
        email: dataZod.email,
        password: hashedPassword,
      },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    res
      .status(201)
      .json({ message: "Usuario creado correctamente", user: newUser });
  })
);

app.post(
  "/auth/login",
  asyncHandler(async (req, res) => {
    //Login de usuario dentro de la base de datos

    const { email, password } = req.body;

    //En caso de que falten datos
    if (!email || !password) {
      return res.status(400).json({ error: "Faltan datos para el login" });
    }

    //Si introducen los datos correctamente, procedo a buscar el usuario en la base de datos

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    //Comparo las passwords
    const passwordMatch = await bycrypt.compare(
      password,
      existingUser.password
    );

    if (!passwordMatch) {
      return res.status(401).json({ error: "Password incorrecta" });
    }

    //Crear el JWT
    const token = signAccesToken(existingUser.id);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    //Si todo es correcto, devuelvo el usuario

    return res.status(200).json({
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
    });
  })
);

app.get(
  "/auth/me",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  })
);

app.post("/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });
  res.status(204).send();
});

//ENDPOINT DE DATOS EXPENSES

//Metodo para obtener los datos
app.get(
  "/expenses/get",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const dataFilterZod = expenses_query_schema.parse(req.query);

    const gastos = await prisma.expense.findMany({
      where: { userId: req.userId, ...dataFilterZod.where },

      take: dataFilterZod.limit ? dataFilterZod.limit : undefined,
    });
    if (gastos.length == 0)
      return res.json({ message: "No hay gastos registrados aun" });

    res.status(200).json({ message: "Datos obtenidos exitosamentes", gastos });
  })
);

//Metodo para subir los gastos
app.post("/expenses/add", requireAuth, async (req: AuthRequest, res) => {
  try {
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
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: err.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      });
    }

    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

//Metodo que elimina un gasto segun su id que viene en los parametros de la URL
app.delete("/expenses/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const deletes = await prisma.expense.deleteMany({
      where: { id, userId: req.userId },
    });

    if (deletes.count == 0)
      return res.status(404).json({ message: "Gasto no encontrado" });

    res.status(201).json({ mesage: "Gasto eliminado exitosamente" });
  } catch (err: any) {
    return res.status(500).json({ error: "No se pudo elimina el gasto" });
  }
});

//Metodo que modifica un gasto en especifico segun su id proveniente de los parametros
app.patch("/expenses/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
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
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: err.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      });
    }

    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

//Metodo que obtiene un gasto de manera individual

app.get("/expenses/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const specificExpense = await prisma.expense.findFirst({
      where: { id, userId: req.userId },
    });

    if (!specificExpense)
      return res.status(404).json({ message: "No se ha encontrado el gasto" });

    return res.status(200).json({ specificExpense });
  } catch (err: any) {
    return res.status(500).json({ error: "Error buscando el gasto" });
  }
});

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en ${PORT}`);
});
