import { Router } from "express";
import { requireAuth, AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/private", requireAuth, (req: AuthRequest, res) => {
  res.json({ ok: true, userId: req.userId });
});
