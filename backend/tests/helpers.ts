import request from "supertest";
import prisma from "../src/db";
import app from "../src/app";

type RegisterOverrides = {
  name?: string;
  email?: string;
  password?: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

/**
 * Limpia la DB de test entre pruebas.
 * Usamos TRUNCATE + CASCADE para evitar residuos y problemas de FK.
 */
export async function clearDb() {
  // Importante: TRUNCATE en Postgres requiere comillas para nombres con mayúsculas
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE "Expense" RESTART IDENTITY CASCADE;
    TRUNCATE TABLE "User" RESTART IDENTITY CASCADE;
  `);
}

/**
 * Registra un usuario y devuelve:
 * - res: respuesta HTTP
 * - payload: el body usado (útil para luego hacer login)
 */
export async function registerUser(overrides?: RegisterOverrides) {
  const payload = {
    name: overrides?.name ?? "Test User",
    email: overrides?.email ?? `test_${Date.now()}_${Math.random()
      .toString(16)
      .slice(2)}@example.com`,
    password: overrides?.password ?? "123456",
  };

  const res = await request(app).post("/auth/register").send(payload);
  return { res, payload };
}

/**
 * Hace login y devuelve:
 * - res: respuesta HTTP
 * - cookie: la cookie "token=..." para usar en endpoints protegidos
 */
export async function loginAndGetCookie(payload: LoginPayload) {
  const res = await request(app).post("/auth/login").send(payload);

  const cookieHeader = res.headers["set-cookie"];
  const cookie = Array.isArray(cookieHeader) ? cookieHeader[0] : undefined;

  return { res, cookie };
}

/**
 * Helper completo: registra + login y te devuelve cookie lista.
 */
export async function registerAndLogin(overrides?: RegisterOverrides) {
  const { res: registerRes, payload } = await registerUser(overrides);

  const { res: loginRes, cookie } = await loginAndGetCookie({
    email: payload.email,
    password: payload.password,
  });

  return {
    registerRes,
    loginRes,
    cookie,
    userPayload: payload,
  };
}
