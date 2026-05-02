import express from "express";
import cors from "cors";
import { pacienteRouter } from "./routers/paciente.js";
import { defaultRouter } from "./routers/default.js";

export const app = express();
// app.use(cors());
app.use(express.json());
app.use(pacienteRouter);
app.use(defaultRouter);
