import express from "express";
import { Medication } from "../models/medications.js";

export const medicationRouter = express.Router();

medicationRouter.post("/medications", async (req, res) => {
  const medication = new Medication(req.body);
  try {
    await medication.save();
    res.status(201).send(medication);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("duplicate key")) {
        res.status(409).send({ error: "El numero de colegiado ya existe" });
      }
      if (error.name === "ValidationError") {
        res.status(400).send(error.message);
      }
    }
    res.status(500).send({ error: "Error interno del servidor" });
  }
});
