import express from "express";
import { Paciente } from "../models/paciente.js";

export const pacienteRouter = express.Router();

pacienteRouter.post("/patients", async (req, res) => {
  const paciente = new Paciente(req.body);
  try {
    await paciente.save();
    res.status(201).send(paciente);
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

pacienteRouter.get("/patients", async (req, res) => {
  const name = req.query.name;
  const IdNumber = req.query.IdNumber;
  if (name !== undefined && !name.toString().trim()) {
    return res.status(400).send({
      error: "El parámetro name no puede estar vacío",
    });
  }

  if (IdNumber !== undefined && !IdNumber.toString().trim()) {
    return res.status(400).send({
      error: "El parametro IdNumber no puede estar vacio",
    });
  }

  const filter: any = {};
  if (name) filter.name = name;
  if (IdNumber) filter.IdNumber = IdNumber;
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

pacienteRouter.get("/patients/:id", async (req, res) => {
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

pacienteRouter.patch("/patients", async (req, res) => {
  if (!req.query.IdNumber && !req.query.name) {
    res.status(400).send({
      error: "Se necesita un numero de identificacion o nombre",
    });
  } else if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).send({
      error: "Se necesitan tener los campos a modificar en la peticion",
    });
  } else {
    const actualizacionesPermitidas = [
      "nombre",
      "contact",
      "status",
      "bloodType",
      "allergies",
      "gender",
      "IdNumber",
      "socialSecurityNumber",
      "dateOfBirth",
    ];
    const actualizacionesAHacer = Object.keys(req.body);
    const esValida = actualizacionesAHacer.every((update) =>
      actualizacionesPermitidas.includes(update),
    );

    if (!esValida) {
      res.status(409).send({
        error: "Actualizacion no fue permitida",
      });
    } else {
      const filter = req.query.IdNumber
        ? { IdNumber: req.query.IdNumber.toString() }
        : { name: req.query.name!.toString() };

      Paciente.findOneAndUpdate(filter, req.body, {
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

pacienteRouter.patch("/patients/:id", async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).send({
      error: "Se necesitan tener los campos a modificar en la peticion",
    });
  } else {
    const actualizacionesPermitidas = [
      "nombre",
      "contact",
      "status",
      "bloodType",
      "allergies",
      "gender",
      "IdNumber",
      "socialSecurityNumber",
      "dateOfBirth",
    ];
    const actualizacionesAHacer = Object.keys(req.body);
    const esValida = actualizacionesAHacer.every((update) =>
      actualizacionesPermitidas.includes(update),
    );

    if (!esValida) {
      res.status(409).send({
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

pacienteRouter.delete("/patients", async (req, res) => {
  if (!req.query.name) {
    res.status(400).send({
      error: "Es necesario un nombre",
    });
  } else {
    Paciente.findOne({ name: req.query.name.toString() })
      .then((paciente) => {
        if (!paciente) {
          res.status(404).send();
        } else {
          return Paciente.findByIdAndDelete(paciente._id).then((paciente) => {
            res.send(paciente);
          });
        }
      })
      .catch((error) => {
        res.status(500).send(error);
      });
  }
});

pacienteRouter.delete("/patients/:id", async (req, res) => {
  Paciente.findByIdAndDelete(req.params.id)
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
});
