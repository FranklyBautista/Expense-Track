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

const PORT = Number(process.env.PORT);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en ${PORT}`);
});
