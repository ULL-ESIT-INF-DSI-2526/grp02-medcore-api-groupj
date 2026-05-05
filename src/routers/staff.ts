import express from "express";
import mongoose from "mongoose";
import { Staff } from "../models/staff.js";
import { MEDICAL_SPECIALTIES } from "../types/staff/specialty.js";

export const staffRouter = express.Router();

staffRouter.post("/staff", async (req, res) => {
  try {
    const member = new Staff(req.body);
    await member.save();
    res.status(201).send(member);
  } 
  catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes("duplicate key")) { 
        return res.status(409).send({error: "El número de colegiado ya existe"});
      }
      if (error.name === "ValidationError") {
        return res.status(400).send(error.message);
      }
    }
    return res.status(500).send({error: "Error interno del servidor"});
  }
});

staffRouter.get("/staff", async (req, res) => {
  try {
    const name = req.query.name;
    const medicalSpecialty = req.query.medicalSpecialty;
    // si se ha pasado alguna especiallidad se verifica que sea válida
    if (medicalSpecialty && !MEDICAL_SPECIALTIES.includes(medicalSpecialty as any)) {
      return res.status(400).send({error: "Especialidad no válida" });
    }
    // se verifica que se han pasado un string por nombre
    if (name !== undefined && typeof name !== "string") {
      return res.status(400).send({error: "Nombre inválido" });
    }
    // se verifica que no este vacio lo que se ha pasado
    if (name === "" || medicalSpecialty === "") {
      return res.status(400).send({error: "Los filtros no pueden estar vacios"});
    }
    const filter: any = {};
    if (name) filter.name = name;
    if (medicalSpecialty) filter.medicalSpecialty = medicalSpecialty;
    const result = await Staff.find(filter);
    if (result.length === 0) {
      return res.status(404).send({error: "No se encontraron resultados"});
    }
    res.send(result);
  }
  catch {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

staffRouter.get("/staff/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({error: "ID inválido"});
    }
    const staff = await Staff.findById(id);
    if (!staff) { 
      return res.status(404).send({ error: "No se encontró el miembro del personal"});
    }
    res.send(staff);
  } 
  catch {
    res.status(500).send({error: "Error interno del servidor"});
  }
});

staffRouter.patch("/staff", async (req, res) => {
  try {
    const ml = req.query.medicalLicenseNum;
    if (typeof ml !== "string" || ml.trim() === "") {
      return res.status(400).send({error: "Se necesita el número de lincencia médica válido",});
    }
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).send({error: "Se requieren campos para modificar",});
    }
    const updated = await Staff.findOneAndUpdate(
      { medicalLicenseNum: ml },
      req.body,
      { returnDocument: "after", runValidators: true }
    );
    if (!updated) {
        return res.status(404).send({ error: "No encontrado" });
      }
    res.send(updated);
  }
  catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes("duplicate key")) { 
        return res.status(409).send({error: "El número de colegiado ya existe"});
      }
      if (error.name === "ValidationError") {
        return res.status(400).send(error.message);
      }
    }
    return res.status(500).send({error: "Error interno del servidor"});
  }
})

staffRouter.patch("/staff/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({error: "ID inválido"});
    }
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).send({error: "Se requieren campos para modificar",});
    }
    const updated = await Staff.findOneAndUpdate(
      { _id: id},
      req.body,
      { returnDocument: "after", runValidators: true }
    );
    if (!updated) {
        return res.status(404).send({ error: "No encontrado" });
      }
    res.send(updated);
  }
  catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes("duplicate key")) { 
        return res.status(409).send({error: "El número de colegiado ya existe"});
      }
      if (error.name === "ValidationError") {
        return res.status(400).send(error.message);
      }
    }
    return res.status(500).send({error: "Error interno del servidor"});
  }
})

