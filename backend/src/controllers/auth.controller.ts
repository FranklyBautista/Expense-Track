import { Request, Response } from "express";
import { login_user_schema, register_user_schema } from "../schemas/user";
import prisma from "../db";
import { hashear_password } from "../utils/hash";
import bycrypt from "bcrypt";
import { signAccesToken } from "../utils/jwt";
import { AuthRequest } from "../middlewares/auth";

export async function register(req: Request, res: Response) {
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
  const hashedPassword = await hashear_password(dataZod.password);

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
}

export async function login(req: Request, res: Response) {
  const dataZod = login_user_schema.parse(req.body);

  const existingUser = await prisma.user.findUnique({
    where: { email: dataZod.email },
  });

  if (!existingUser) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  //Comparo las passwords
  const passwordMatch = await bycrypt.compare(
    dataZod.password,
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
}

export async function me(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  if (!user) return res.status(404).json({ error: "User not found" });

  res.json(user);
}

export async function logout(req: Request, res: Response) {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });
  res.status(204).send();
}
