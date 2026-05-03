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

pacienteRouter.patch("/pacientes", async (req, res) => {
  if (!req.query.IdNumber) {
    res.status(400).send({
      error: "Se necesita un numero de identificacion",
    });
  } else if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).send({
      error: "Se necesitan tener los campos a modificar en la peticion",
    });
  } else {
    const actualizacionesPermitidas = ["nombre", "contact", "status"];
    const actualizacionesAHacer = Object.keys(req.body);
    const esValida = actualizacionesAHacer.every((update) =>
      actualizacionesPermitidas.includes(update),
    );

    if (!esValida) {
      res.status(400).send({
        error: "Actualizacion no fue permitida",
      });
    } else {
      Paciente.findOneAndUpdate(
        { IdNumber: req.query.IdNumber.toString() },
        req.body,
        {
          returnDocument: "after",
          runValidators: true,
        },
      )
        .then((paciente) => {
          if (!paciente) {
            res.status(404).send();
          } else {
            res.send(paciente);
          }
        })
        .catch((error) => {
          res.status(500).send(error);
        });
    }
  }
});

pacienteRouter.patch("/pacientes/:id", async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).send({
      error: "Se necesitan tener los campos a modificar en la peticion",
    });
  } else {
    const actualizacionesPermitidas = ["nombre", "contact", "status"];
    const actualizacionesAHacer = Object.keys(req.body);
    const esValida = actualizacionesAHacer.every((update) =>
      actualizacionesPermitidas.includes(update),
    );

    if (!esValida) {
      res.status(400).send({
        error: "Actualizacion no fue permitida",
      });
    } else {
      Paciente.findByIdAndUpdate(req.params.id, req.body, {
        returnDocument: "after",
        runValidators: true,
      })
        .then((paciente) => {
          if (!paciente) {
            res.status(404).send();
          } else {
            res.send(paciente);
          }
        })
        .catch((error) => {
          res.status(500).send(error);
        });
    }
  }
});
