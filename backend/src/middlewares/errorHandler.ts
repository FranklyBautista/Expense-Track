import type { Request, Response, NextFunction } from "express";
import path from "node:path";
import { ZodError } from "zod";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  //1) Errores de validacion de tipo ZOD
  if (err instanceof ZodError) {
    return res.status(400).json({
      erro: "Validation error",
      details: err.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
  }

  // Cualquier otro error
  console.error(err);
  return res.status(500).json({
    error: "Server error",
  });
}
