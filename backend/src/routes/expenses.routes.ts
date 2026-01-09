import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  list,
  create,
  getOne,
  remove,
  update,
} from "../controllers/expenses.controller";

const router = Router();

router.get("/get", requireAuth, asyncHandler(list));
router.get("/:id", requireAuth, asyncHandler(getOne));
router.post("/create", requireAuth, asyncHandler(create));
router.delete("/:id", requireAuth, asyncHandler(remove));
router.patch("/:id", requireAuth, asyncHandler(update));

export default router;
