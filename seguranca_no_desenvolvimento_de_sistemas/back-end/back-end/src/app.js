import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/user.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors());

app.use("/usuarios", userRoutes);

export default app;