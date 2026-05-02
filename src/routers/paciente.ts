import express from "express";
import { Paciente } from "../models/paciente.js";

export const pacienteRouter = express.Router();

pacienteRouter.post("/pacientes", async (req, res) => {
  const paciente = new Paciente(req.body);
  try {
    await paciente.save();
    res.status(201).send(paciente);
  } catch (error) {
    res.status(500).send(error);
  }
});

pacienteRouter.get("/pacientes", async (req, res) => {
  const filter = req.query.name ? { name: req.query.name.toString() } : {};

  try {
    const pacientes = await Paciente.find(filter);

    if (pacientes.length !== 0) {
      res.send(pacientes);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

pacienteRouter.get("/pacientes/:id", async (req, res) => {
  try {
    const paciente = await Paciente.findById(req.params.id);
    
    if (paciente) {
      res.send(paciente);
    } else {
      res.status(404).send({ error: "Paciente no encontrado" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});