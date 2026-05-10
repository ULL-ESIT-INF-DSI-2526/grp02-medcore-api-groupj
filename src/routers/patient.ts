import express from "express";
import mongoose from "mongoose";
import { Patient } from "../models/patient.js";
import { Record } from "../models/records.js";
import { Medication } from "../models/medications.js";

export const patientRouter = express.Router();

patientRouter.post("/patients", async (req, res) => {
  const patient = new Patient(req.body);
  try {
    await patient.save();
    res.status(201).send(patient);
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

patientRouter.get("/patients", async (req, res) => {
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
  Patient.find(filter)
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

patientRouter.get("/patients/:id", async (req, res) => {
  Patient.findById(req.params.id)
    .then((patient) => {
      if (patient) {
        res.send(patient);
      } else {
        res.status(404).send({ error: "Patient no encontrado" });
      }
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

patientRouter.patch("/patients", async (req, res) => {
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

      Patient.findOneAndUpdate(filter, req.body, {
        returnDocument: "after",
        runValidators: true,
      })
        .then((patient) => {
          if (!patient) {
            res.status(404).send();
          } else {
            res.send(patient);
          }
        })
        .catch((error) => {
          res.status(500).send(error);
        });
    }
  }
});

patientRouter.patch("/patients/:id", async (req, res) => {
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
      Patient.findByIdAndUpdate(req.params.id, req.body, {
        returnDocument: "after",
        runValidators: true,
      })
        .then((patient) => {
          if (!patient) {
            res.status(404).send();
          } else {
            res.send(patient);
          }
        })
        .catch((error) => {
          res.status(500).send(error);
        });
    }
  }
});

patientRouter.delete("/patients", async (req, res) => {
  try {
    if (!req.query.IdNumber && !req.query.name) {
      res.status(400).send({
        error: "Se necesita un numero de identificacion o nombre",
      });
    }
    const filter = req.query.IdNumber
      ? { IdNumber: req.query.IdNumber.toString() }
      : { name: req.query.name!.toString() };

    const patientIds = (await Patient.find(filter)).map((p) => p._id);
    const record = await Record.find({ patient: { $in: patientIds } });
    for (const r of record) {
      const medicines = r.prescribedMedications;
      for (const m in medicines) {
        const medication = await Medication.findById(medicines[m].medication);
        if (medication) {
          medication.stockDisponible += medicines[m].units;
          await medication.save();
        }
      }
      const delete_record = await Record.findByIdAndDelete(r._id);
    }
    const result = await Patient.deleteMany(filter);
    if (result.deletedCount === 0) {
      return res.status(404).send();
    }
    res.send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

patientRouter.delete("/patients/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send({ error: "ID inválido" });
    }
    const record = await Record.find({ patient: req.params.id });
    for (const r of record) {
      const medicines = r.prescribedMedications;
      for (const m in medicines) {
        const medication = await Medication.findById(medicines[m].medication);
        if (medication) {
          medication.stockDisponible += medicines[m].units;
          await medication.save();
        }
      }
      const delete_record = await Record.findByIdAndDelete(r._id);
    }
    const result = await Patient.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).send();
    }
    res.send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});
