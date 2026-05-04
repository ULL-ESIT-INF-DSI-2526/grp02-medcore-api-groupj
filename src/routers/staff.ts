import express from "express";
import { Staff } from "../models/staff.js";
import { MongoServerError } from "mongodb";
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
    const nameRaw = req.query.name;
    const specRaw = req.query.medicalSpecialty;
    // se verifica que se han pasado strings
    if (nameRaw !== undefined && typeof nameRaw !== "string") {
      return res.status(400).send({error: "Nombre inválido" });
    }
    if (specRaw !== undefined && typeof specRaw !== "string") {
      return res.status(400).send({error: "Especialidad inválida" });
    }
    const name = nameRaw;
    const medicalSpecialty = specRaw;
    // se verifica que no este vacio lo que se ha pasado
    if (name === "" || medicalSpecialty === "") {
      return res.status(400).send({error: "Los filtros no pueden estar vacios"});
    }
    // si se ha pasado alguna especiallidad se verifica que sea válida
    if (medicalSpecialty && !MEDICAL_SPECIALTIES.includes(medicalSpecialty as any)) {
      return res.status(400).send({error: "Especialidad no válida" });
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