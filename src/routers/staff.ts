import express from "express";
import mongoose from "mongoose";
import { Staff } from "../models/staff.js";
import { Record } from "../models/records.js";
import { MEDICAL_SPECIALTIES } from "../types/staff/specialty.js";

export const staffRouter = express.Router();

/**
 * @swagger
 * /staff:
 *   post:
 *     summary: Crear un nuevo miembro del personal sanitario
 *     tags:
 *       - Staff
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Staff'
 *     responses:
 *       201:
 *         description: Miembro del personal creado correctamente
 *       400:
 *         description: Error de validación
 *       409:
 *         description: Número de colegiado duplicado
 *       500:
 *         description: Error interno del servidor
 */
staffRouter.post("/staff", async (req, res) => {
  try {
    const member = new Staff(req.body);
    await member.save();
    res.status(201).send(member);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes("duplicate key")) {
        return res
          .status(409)
          .send({ error: "El número de colegiado ya existe" });
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
 * /staff:
 *   get:
 *     summary: Obtener miembros del personal sanitario
 *     tags:
 *       - Staff
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Nombre del miembro del personal
 *       - in: query
 *         name: medicalSpecialty
 *         schema:
 *           type: string
 *         description: Especialidad médica
 *     responses:
 *       200:
 *         description: Lista de personal sanitario
 *       400:
 *         description: Parámetros inválidos
 *       404:
 *         description: No se encontraron resultados
 *       500:
 *         description: Error interno del servidor
 */
staffRouter.get("/staff", async (req, res) => {
  try {
    const name = req.query.name;
    const medicalSpecialty = req.query.medicalSpecialty;
    // si se ha pasado alguna especiallidad se verifica que sea válida
    if (
      medicalSpecialty &&
      !MEDICAL_SPECIALTIES.includes(medicalSpecialty as any)
    ) {
      return res.status(400).send({ error: "Especialidad no válida" });
    }
    // se verifica que se han pasado un string por nombre
    if (name !== undefined && typeof name !== "string") {
      return res.status(400).send({ error: "Nombre inválido" });
    }
    // se verifica que no este vacio lo que se ha pasado
    if (name === "" || medicalSpecialty === "") {
      return res
        .status(400)
        .send({ error: "Los filtros no pueden estar vacios" });
    }
    const filter: any = {};
    if (name) filter.name = name;
    if (medicalSpecialty) filter.medicalSpecialty = medicalSpecialty;
    const result = await Staff.find(filter);
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
 * /staff/{id}:
 *   get:
 *     summary: Obtener un miembro del personal por ID
 *     tags:
 *       - Staff
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Miembro del personal encontrado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Miembro del personal no encontrado
 *       500:
 *         description: Error interno del servidor
 */
staffRouter.get("/staff/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ error: "ID inválido" });
    }
    const staff = await Staff.findById(id);
    if (!staff) {
      return res
        .status(404)
        .send({ error: "No se encontró el miembro del personal" });
    }
    res.send(staff);
  } catch {
    res.status(500).send({ error: "Error interno del servidor" });
  }
});

/**
 * @swagger
 * /staff:
 *   patch:
 *     summary: Actualizar un miembro del personal mediante número de colegiado
 *     tags:
 *       - Staff
 *     parameters:
 *       - in: query
 *         name: medicalLicenseNum
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Staff'
 *     responses:
 *       200:
 *         description: Miembro actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: No encontrado
 *       409:
 *         description: Conflicto de datos
 *       500:
 *         description: Error interno del servidor
 */
staffRouter.patch("/staff", async (req, res) => {
  try {
    const ml = req.query.medicalLicenseNum;
    if (typeof ml !== "string" || ml.trim() === "") {
      return res
        .status(400)
        .send({ error: "Se necesita el número de lincencia médica válido" });
    }
    if (!req.body || Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .send({ error: "Se requieren campos para modificar" });
    }
    const updated = await Staff.findOneAndUpdate(
      { medicalLicenseNum: ml },
      req.body,
      { returnDocument: "after", runValidators: true },
    );
    if (!updated) {
      return res.status(404).send({ error: "No encontrado" });
    }
    res.send(updated);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes("duplicate key")) {
        return res
          .status(409)
          .send({ error: "El número de colegiado ya existe" });
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
 * /staff/{id}:
 *   patch:
 *     summary: Actualizar un miembro del personal por ID
 *     tags:
 *       - Staff
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
 *             $ref: '#/components/schemas/Staff'
 *     responses:
 *       200:
 *         description: Miembro actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: No encontrado
 *       409:
 *         description: Conflicto de datos
 *       500:
 *         description: Error interno del servidor
 */
staffRouter.patch("/staff/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ error: "ID inválido" });
    }
    if (!req.body || Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .send({ error: "Se requieren campos para modificar" });
    }
    const updated = await Staff.findOneAndUpdate({ _id: id }, req.body, {
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
        return res
          .status(409)
          .send({ error: "El número de colegiado ya existe" });
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
 * /staff:
 *   delete:
 *     summary: Eliminar un miembro del personal mediante número de colegiado
 *     tags:
 *       - Staff
 *     parameters:
 *       - in: query
 *         name: medicalLicenseNum
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Miembro eliminado correctamente
 *       400:
 *         description: Número de licencia inválido
 *       404:
 *         description: Miembro no encontrado
 *       409:
 *         description: El miembro tiene registros asociados
 *       500:
 *         description: Error interno del servidor
 */
staffRouter.delete("/staff", async (req, res) => {
  try {
    const ml = req.query.medicalLicenseNum;
    if (typeof ml !== "string" || ml.trim() === "") {
      return res
        .status(400)
        .send({ error: "Se necesita el número de licencia médica válido" });
    }

    const staffToDelete = await Staff.findOne({ medicalLicenseNum: ml });
    if (!staffToDelete) {
      return res
        .status(404)
        .send({ error: "Miembro del personal no encontrado" });
    }

    // Verificar si hay records que tengan este staff como responsable
    const recordsWithStaff = await Record.findOne({
      responsibleStaff: staffToDelete._id,
    });

    if (recordsWithStaff) {
      return res.status(409).send({
        error:
          "No se puede eliminar el personal. Existe al menos un record asignado a este miembro del staff",
      });
    }

    const deleted = await Staff.findOneAndDelete({ medicalLicenseNum: ml });
    res.send(deleted);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === "ValidationError") {
        return res.status(400).send(error.message);
      }
    }
    return res.status(500).send({ error: "Error interno del servidor" });
  }
});

/**
 * @swagger
 * /staff/{id}:
 *   delete:
 *     summary: Eliminar un miembro del personal por ID
 *     tags:
 *       - Staff
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Miembro eliminado correctamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Miembro no encontrado
 *       409:
 *         description: El miembro tiene registros asociados
 *       500:
 *         description: Error interno del servidor
 */
staffRouter.delete("/staff/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ error: "ID inválido" });
    }

    const staffToDelete = await Staff.findById(id);
    if (!staffToDelete) {
      return res
        .status(404)
        .send({ error: "Miembro del personal no encontrado" });
    }

    // Verificar si hay records que tengan este staff como responsable
    const recordsWithStaff = await Record.findOne({
      responsibleStaff: id,
    });

    if (recordsWithStaff) {
      return res.status(409).send({
        error:
          "No se puede eliminar el personal. Existe al menos un record asignado a este miembro del staff",
      });
    }

    const deleted = await Staff.findByIdAndDelete(id);
    res.send(deleted);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === "ValidationError") {
        return res.status(400).send(error.message);
      }
    }
    return res.status(500).send({ error: "Error interno del servidor" });
  }
});
