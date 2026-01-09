import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "../src/routes/auth.routes";
import expensesRoutes from "../src/routes/expenses.routes";

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

app.get("/health", async (req, res) => {
  res.json("RUTA SALUDABLE");
});

app.use("/auth", authRoutes);
app.use("/expenses", expensesRoutes);

app.use(errorHandler);

export default app;
