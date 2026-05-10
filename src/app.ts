import express from "express";
import { patientRouter } from "./routers/patient.js";
import { defaultRouter } from "./routers/default.js";
import { staffRouter } from "./routers/staff.js";
import { medicationRouter } from "./routers/medication.js";
import { recordRouter } from "./routers/records.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

/**
 * Instancia principal de la aplicación Express.
 */
export const app = express();

/**
 * Middleware para parsear cuerpos JSON en las peticiones HTTP.
 */
app.use(express.json());

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec),
);

app.get("/api-docs.json", (_req, res) => {
  res.json(swaggerSpec);
});

/**
 * Configura el formato de salida JSON con indentación de 2 espacios
 * para mejorar la legibilidad de las respuestas.
 */
app.set("json spaces", 2);
app.use(patientRouter);
app.use(staffRouter);
app.use(medicationRouter);
app.use(recordRouter);
app.use(defaultRouter);