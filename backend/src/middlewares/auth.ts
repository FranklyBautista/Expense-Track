import { Request, Response, NextFunction } from "express";
import { verifyAccesToken } from "../utils/jwt";
import { error } from "node:console";

export type AuthRequest = Request & { userId?: string };

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies?.token;

  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const payload = verifyAccesToken(token);
    const userId = payload.sub;
    if (!userId) return res.status(401).json({ error: "Invalid Token" });

    req.userId = userId;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
