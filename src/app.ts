import express from "express";
import { pacienteRouter } from "./routers/paciente.js";
import { defaultRouter } from "./routers/default.js";
import { staffRouter } from "./routers/staff.js";
import { medicationRouter } from "./routers/medication.js";
import { recordRouter } from "./routers/records.js";

export const app = express();
app.use(express.json());
app.set("json spaces", 2);
app.use(pacienteRouter);
app.use(staffRouter);
app.use(medicationRouter);
app.use(recordRouter);
app.use(defaultRouter);
