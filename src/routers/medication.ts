import express from "express";
import { Medication } from "../models/medications.js";
import mongoose from "mongoose";

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

medicationRouter.get("/medications", async (req, res) => {
  try {
    const name = req.query.name;
    const activo = req.query.nombreActivo;
    const codigo = req.query.codigoNacional;

    if (name !== undefined && typeof name !== "string") {
      return res.status(400).send({ error: "Nombre invalido" });
    }

    if (activo !== undefined && typeof activo !== "string") {
      return res.status(400).send({ error: "Nombre de activo invalido" });
    }

    if (codigo !== undefined && typeof codigo !== "string") {
      return res.status(400).send({ error: "Codigo nacional invalido" });
    }
    if (name === "" || activo === "" || codigo === "") {
      return res.status(400).send({error: "Los filtros no pueden estar vacios"});
    }
    const filter: any = {};
    if (name) filter.name = name;
    if (activo) filter.nombreActivo = activo;
    if (codigo) filter.codigoNacional = codigo;
    const result = await Medication.find(filter);
    if (result.length === 0) {
      return res.status(404).send({ error: "No se encontraron resultados" });
    }
    res.send(result);
  } catch {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

medicationRouter.get("/medications/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ error: "ID invalido" });
    }
    const medicamento = await Medication.findById(id);
    if (!medicamento) {
      return res
        .status(404)
        .send({ error: "No se encontro el miembro del personal" });
    }
    res.send(medicamento);
  } catch {
    res.status(500).send({ error: "Error interno del servidor" });
  }
});
