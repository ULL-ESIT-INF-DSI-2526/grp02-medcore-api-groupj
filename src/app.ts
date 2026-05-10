import express from "express";
import { pacienteRouter } from "./routers/paciente.js";
import { defaultRouter } from "./routers/default.js";
import { staffRouter } from "./routers/staff.js";
import { medicationRouter } from "./routers/medication.js";
import { recordRouter } from "./routers/records.js";

/**
 * Instancia principal de la aplicación Express.
 */
export const app = express();

/**
 * Middleware para parsear cuerpos JSON en las peticiones HTTP.
 */
app.use(express.json());

/**
 * Configura el formato de salida JSON con indentación de 2 espacios
 * para mejorar la legibilidad de las respuestas.
 */
app.set("json spaces", 2);

/**
 * Registro de routers de la aplicación.
 */
app.use(pacienteRouter);
app.use(staffRouter);
app.use(medicationRouter);
app.use(recordRouter);
app.use(defaultRouter);
