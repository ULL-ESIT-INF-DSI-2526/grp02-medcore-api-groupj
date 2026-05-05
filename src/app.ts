import express from "express";
import { pacienteRouter } from "./routers/paciente.js";
import { defaultRouter } from "./routers/default.js";

export const app = express();
app.use(express.json());
app.use(pacienteRouter);
app.use(defaultRouter);
