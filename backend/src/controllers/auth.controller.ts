import { Request, Response } from "express";
import { login_user_schema, register_user_schema } from "../schemas/user";
import prisma from "../db";
import { hashear_password } from "../utils/hash";
import bycrypt from "bcrypt";
import { signAccesToken } from "../utils/jwt";
import { AuthRequest } from "../middlewares/auth";

function getCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: (isProd ? "none" : "lax") as "none" | "lax",
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export async function register(req: Request, res: Response) {
  const dataZod = register_user_schema.parse(req.body);

  const existingUser = await prisma.user.findUnique({
    where: { email: dataZod.email },
  });

  if (existingUser) {
    return res.status(400).json({ error: "El usuario ya existe" });
  }

  const hashedPassword = await hashear_password(dataZod.password);

  const newUser = await prisma.user.create({
    data: {
      name: dataZod.name,
      email: dataZod.email,
      password: hashedPassword,
    },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return res.status(201).json({
    data: newUser,
    message: "User created",
  });
}

export async function login(req: Request, res: Response) {
  const dataZod = login_user_schema.parse(req.body);

  const existingUser = await prisma.user.findUnique({
    where: { email: dataZod.email },
  });

  if (!existingUser) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  const passwordMatch = await bycrypt.compare(
    dataZod.password,
    existingUser.password
  );

  if (!passwordMatch) {
    return res.status(401).json({ error: "Password incorrecta" });
  }

  const token = signAccesToken(existingUser.id);

  res.cookie("token", token, getCookieOptions());

  return res.status(200).json({
    data: {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
    },
    message: "Logged in",
  });
}

export async function me(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.status(200).json({ data: user });
}

export async function logout(req: Request, res: Response) {
  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    sameSite: (isProd ? "none" : "lax") as "none" | "lax",
    secure: isProd,
  });

  return res.status(204).send();
}
