import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { asyncHandler } from "../middlewares/asyncHandler";
import { register, login, logout, me } from "../controllers/auth.controller";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", requireAuth, asyncHandler(me));
router.post("/logout", logout);

export default router;
