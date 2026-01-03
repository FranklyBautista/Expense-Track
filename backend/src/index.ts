import "dotenv/config";
import express from "express";
import cors from "cors";
import prisma from "./db";
import bycrypt from "bcrypt";
import cookieParser from "cookie-parser";
import { error, log } from "node:console";
import { requireAuth, AuthRequest } from "./middlewares/auth";

import { hashear_password } from "./utils/hash";
import { signAccesToken } from "./utils/jwt";
import { connect } from "node:http2";
import { json } from "node:stream/consumers";

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

app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    //Valido que los datos esten completos
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Falta datos para el registro" });
    }

    //Si no faltan datos procedo a ver si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }
    //Si el usuario no existe, procedo a crearlo e implementarlo dentro de la base de datos

    //Hasheo la password antes de guardarla
    const hashedPassword = await hashear_password(password);

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    res
      .status(201)
      .json({ message: "Usuario creado correctamente", user: newUser });
  } catch (err: any) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({
      error: "Error interno al registrar",
      details: err?.message ?? err,
      code: err?.code,
    });
  }
});

app.post("/auth/login", async (req, res) => {
  //Login de usuario dentro de la base de datos
  try {
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
  } catch (err: any) {
    return res.status(500).json({ message: "Error al buscar el usuario" });
  }
});

app.get("/auth/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: "server error" });
  }
});

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
app.get("/expenses/get", requireAuth, async (req: AuthRequest, res) => {
  try {
    const gastos = await prisma.expense.findMany({
      where: { userId: req.userId },
    });
    if (gastos.length == 0)
      return res.json({ message: "No hay gastos registrados aun" });

    res.status(200).json({ message: "Datos obtenidos exitosamentes", gastos });
  } catch (err: any) {
    return res.json({ error: "No se ha podido encontrar los expenses" });
  }
});

//Metodo para subir los gastos
app.post("/expenses/add", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, amount, info, category } = req.body;

    if (!title || !amount) {
      res.json({ message: "titulo y monto son campos obligatorios" });
    }

    const newExpense = await prisma.expense.create({
      data: {
        title,
        amount: Number(amount),
        info,
        category,
        user: {
          connect: { id: req.userId },
        },
      },
    });

    return res.status(201).json({ message: "Creado exitosamente", newExpense });
  } catch (err: any) {}
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
  const { id } = req.params;
  const { title, amount, category } = req.body as {
    title?: String;
    amount?: number;
    category?: String | null;
  };

  // 1) Verificar que el expense sea de usuario
  const existingExpense = await prisma.expense.findFirst({
    where: { id, userId: req.userId },
    select: { id: true },
  });

  if (!existingExpense)
    return res.status(404).json({ message: "Mp se ha encontrado el gasto" });

  const dataToUpdate: any = {};

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return res
        .status(400)
        .json({ error: "title must be a non-empty string" });
    }
    dataToUpdate.title = title.trim();
  }

  if (amount !== undefined) {
    if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ error: "amount must be a positive number" });
    }
    dataToUpdate.amount = amount;
  }

  if (category !== undefined) {
    if (category === null || category === "") dataToUpdate.category = null;
    else {
      if (typeof category !== "string") {
        return res.status(400).json({ error: "category must be a string" });
      }
      dataToUpdate.category = category.trim();
    }
  }

  if (Object.keys(dataToUpdate).length === 0) {
    return res.status(400).json({ error: "no fields to update" });
  }

  const updated = await prisma.expense.update({
    where: { id },
    data: dataToUpdate,
  });

  res.json(updated);
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

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en ${PORT}`);
});
