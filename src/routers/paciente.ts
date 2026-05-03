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
  if (req.query.name !== undefined && !req.query.name.toString().trim()) {
    return res.status(400).send({
      error: "El parámetro name no puede estar vacío",
    });
  }

  const filter = req.query.name ? { name: req.query.name.toString() } : {};
  Paciente.find(filter)
    .then((pacientes) => {
      if (pacientes.length !== 0) {
        res.send(pacientes);
      } else {
        res.status(404).send();
      }
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

pacienteRouter.get("/pacientes/:id", async (req, res) => {
  Paciente.findById(req.params.id)
    .then((paciente) => {
      if (paciente) {
        res.send(paciente);
      } else {
        res.status(404).send({ error: "Paciente no encontrado" });
      }
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

