import express from "express";
import { Medication } from "../models/medications.js";
import { Record } from "../models/records.js";
import mongoose from "mongoose";

export const medicationRouter = express.Router();

/**
 * @swagger
 * /medications:
 *   post:
 *     summary: Crear un nuevo medicamento
 *     tags:
 *       - Medications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Medication'
 *     responses:
 *       201:
 *         description: Medicamento creado correctamente
 *       400:
 *         description: Error de validación
 *       409:
 *         description: Código nacional duplicado
 *       500:
 *         description: Error interno del servidor
 */
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

/**
 * @swagger
 * /medications:
 *   get:
 *     summary: Obtener medicamentos
 *     tags:
 *       - Medications
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Nombre comercial del medicamento
 *       - in: query
 *         name: nombreActivo
 *         schema:
 *           type: string
 *         description: Nombre del principio activo
 *       - in: query
 *         name: codigoNacional
 *         schema:
 *           type: string
 *         description: Código nacional del medicamento
 *     responses:
 *       200:
 *         description: Lista de medicamentos
 *       400:
 *         description: Parámetros inválidos
 *       404:
 *         description: No se encontraron resultados
 *       500:
 *         description: Error interno del servidor
 */
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
      return res
        .status(400)
        .send({ error: "Los filtros no pueden estar vacios" });
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

/**
 * @swagger
 * /medications/{id}:
 *   get:
 *     summary: Obtener un medicamento por ID
 *     tags:
 *       - Medications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medicamento encontrado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Medicamento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
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

/**
 * @swagger
 * /medications:
 *   patch:
 *     summary: Actualizar un medicamento mediante filtros
 *     tags:
 *       - Medications
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: nombreActivo
 *         schema:
 *           type: string
 *       - in: query
 *         name: codigoNacional
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Medication'
 *     responses:
 *       200:
 *         description: Medicamento actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Medicamento no encontrado
 *       409:
 *         description: Código nacional duplicado
 *       500:
 *         description: Error interno del servidor
 */
medicationRouter.patch("/medications", async (req, res) => {
  try {
    const name = req.query.name;
    const activo = req.query.nombreActivo;
    const codigo = req.query.codigoNacional;

    if (!name && !activo && !codigo) {
      return res.status(400).send({ error: "Nombre invalido" });
    }
    if (!req.body || Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .send({ error: "Se requieren campos para modificar" });
    }
    const filter: any = {};
    if (name) filter.name = name;
    if (activo) filter.nombreActivo = activo;
    if (codigo) filter.codigoNacional = codigo;
    const updated = await Medication.findOneAndUpdate(filter, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).send({ error: "No encontrado" });
    }
    res.send(updated);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes("duplicate key")) {
        return res.status(409).send({ error: "El codigo nacional ya existe" });
      }
      if (error.name === "ValidationError") {
        return res.status(400).send(error.message);
      }
    }
    return res.status(500).send({ error: "Error interno del servidor" });
  }
});

/**
 * @swagger
 * /medications/{id}:
 *   patch:
 *     summary: Actualizar un medicamento por ID
 *     tags:
 *       - Medications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Medication'
 *     responses:
 *       200:
 *         description: Medicamento actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Medicamento no encontrado
 *       409:
 *         description: Código nacional duplicado
 *       500:
 *         description: Error interno del servidor
 */
medicationRouter.patch("/medications/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ error: "ID invalido" });
    }
    if (!req.body || Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .send({ error: "Se requieren campos para modificar" });
    }
    const updated = await Medication.findOneAndUpdate({ _id: id }, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).send({ error: "No encontrado" });
    }
    res.send(updated);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes("duplicate key")) {
        return res.status(409).send({ error: "El codigo nacional ya existe" });
      }
      if (error.name === "ValidationError") {
        return res.status(400).send(error.message);
      }
    }
    return res.status(500).send({ error: "Error interno del servidor" });
  }
});

/**
 * @swagger
 * /medications:
 *   delete:
 *     summary: Eliminar un medicamento mediante filtros
 *     tags:
 *       - Medications
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: nombreActivo
 *         schema:
 *           type: string
 *       - in: query
 *         name: codigoNacional
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medicamento eliminado correctamente
 *       400:
 *         description: Filtros inválidos
 *       404:
 *         description: Medicamento no encontrado
 *       409:
 *         description: El medicamento está asociado a registros clínicos
 *       500:
 *         description: Error interno del servidor
 */
medicationRouter.delete("/medications", async (req, res) => {
  try {
    const name = req.query.name;
    const activo = req.query.nombreActivo;
    const codigo = req.query.codigoNacional;

    if (!name && !activo && !codigo) {
      return res
        .status(400)
        .send({ error: "Se necesita al menos un filtro para eliminar" });
    }

    const filter: any = {};
    if (name) filter.name = name;
    if (activo) filter.nombreActivo = activo;
    if (codigo) filter.codigoNacional = codigo;

    const medicationToDelete = await Medication.findOne(filter);
    if (!medicationToDelete) {
      return res.status(404).send({ error: "Medicación no encontrada" });
    }

    // Verificar si hay records que contengan esta medicación
    const recordsWithMedication = await Record.findOne({
      "prescribedMedications.medication": medicationToDelete._id,
    });

    if (recordsWithMedication) {
      return res.status(409).send({
        error:
          "No se puede eliminar la medicación. Existe al menos un record que la contiene",
      });
    }

    const deleted = await Medication.findOneAndDelete(filter);
    res.send(deleted);
  } catch (error) {
    res.status(500).send({ error: "Error interno del servidor" });
  }
});

/**
 * @swagger
 * /medications/{id}:
 *   delete:
 *     summary: Eliminar un medicamento por ID
 *     tags:
 *       - Medications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medicamento eliminado correctamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Medicamento no encontrado
 *       409:
 *         description: El medicamento está asociado a registros clínicos
 *       500:
 *         description: Error interno del servidor
 */
medicationRouter.delete("/medications/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ error: "ID invalido" });
    }

    const medicationToDelete = await Medication.findById(id);
    if (!medicationToDelete) {
      return res.status(404).send({ error: "Medicación no encontrada" });
    }

    // Verificar si hay records que contengan esta medicación
    const recordsWithMedication = await Record.findOne({
      "prescribedMedications.medication": id,
    });

    if (recordsWithMedication) {
      return res.status(409).send({
        error:
          "No se puede eliminar la medicación. Existe al menos un record que la contiene",
      });
    }

    const deleted = await Medication.findByIdAndDelete(id);
    res.send(deleted);
  } catch (error) {
    res.status(500).send({ error: "Error interno del servidor" });
  }
});
