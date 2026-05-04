import express from "express";
import cors from "cors";
import { pacienteRouter } from "./routers/paciente.js";
import { defaultRouter } from "./routers/default.js";
import { staffRouter } from "./routers/staff.js";

export const app = express();
// app.use(cors());
app.use(express.json());
app.set("json spaces", 2);
app.use(pacienteRouter);
app.use(staffRouter);
app.use(defaultRouter);
