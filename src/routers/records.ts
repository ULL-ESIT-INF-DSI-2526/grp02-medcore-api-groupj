import express from "express";
import mongoose from "mongoose";
import { Record } from "../models/records.js";
import { Medication } from "../models/medications.js";
import { validateMainData } from "../utils/records/validate/validateMainData.js";
import { validateArray } from "../utils/records/validate/validateMainData.js";
import { validateString } from "../utils/records/validate/validateMainData.js";
import { validateDates } from "../utils/records/validate/validateDate.js";
import { validatePatchDates } from "../utils/records/validate/validatePatchDates.js";
import { validatePatchBody } from "../utils/records/validate/validatePatchBody.js";
import { validateGetData } from "../utils/records/validate/validateGetData.js";
import { processMedications } from "../utils/records/id/processMedications.js";
import { RollbackMedication } from "../types/consultas/rollbackMedication.js";
import { AppError } from "../utils/records/error/appError.js";
import { ValidationErrors } from "../utils/records/error/validationErrors.js";
import { getPatientID } from "../utils/records/id/getPatientID.js";
import { getStaffID } from "../utils/records/id/getStaffID.js";
import { updateMedicationStock } from "../utils/records/rollback/updateMedicationStock.js";
import { getRollback } from "../utils/records/rollback/getRollback.js";

export const recordRouter = express.Router();

/**
 * @swagger
 * /records:
 *   post:
 *     summary: Crear un nuevo registro clínico
 *     tags:
 *       - Records
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecordInput'
 *     responses:
 *       201:
 *         description: Registro clínico creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *       400:
 *         description: Error de validación
 *       403:
 *         description: Médico inactivo o medicamento caducado
 *       404:
 *         description: Paciente, médico o medicamento no encontrado
 *       409:
 *         description: Stock insuficiente
 *       500:
 *         description: Error interno del servidor
 */
recordRouter.post("/records", async (req, res) => {
  const rollback: RollbackMedication[] = [];
  try {
    const {
      idDocument,
      medicalLicense,
      medicationList,
      recordType,
      admissionDateTime,
      dischargeDateTime,
      reason,
      diagnosis,
      recordStatus,
    } = req.body;
    validateMainData(idDocument, medicalLicense, medicationList);
    validateDates(admissionDateTime, dischargeDateTime, recordStatus);
    const patient = await getPatientID(idDocument);
    const responsibleStaff = await getStaffID(medicalLicense);
    const { prescribedMedications, amount } = await processMedications(
      medicationList,
      rollback,
    );
    const record = new Record({
      patient,
      responsibleStaff,
      recordType,
      admissionDateTime,
      dischargeDateTime,
      reason,
      diagnosis,
      prescribedMedications,
      amount,
      recordStatus,
    });
    await record.save();
    res.status(201).send(record);
  } catch (error: unknown) {
    if (rollback.length > 0) {
      try {
        await updateMedicationStock(rollback, 1);
      } catch (rollbackError) {
        console.error(rollbackError);
      }
    }
    if (error instanceof ValidationErrors) {
      return res
        .status(error.statusCode)
        .send({ error: error.message, details: error.errors });
    } else if (error instanceof AppError) {
      return res.status(error.statusCode).send({ error: error.message });
    } else if (error instanceof Error) {
        if (error.name === "ValidationError") {
          return res.status(400).send({ error: error.message });
        }
    }
    return res.status(500).send({ error: "Error interno del servidor" });
  }
});

/**
 * @swagger
 * /records:
 *   get:
 *     summary: Obtener registros clínicos
 *     description: |
 *       Permite consultar registros clínicos mediante:
 *
 *       - Documento identificativo del paciente (`idDocument`)
 *       - Rango de fechas (`startDate` y `endDate`)
 *       - Tipo de registro (`recordType`)
 *
 *       Los resultados se devuelven ordenados cronológicamente.
 *     tags:
 *       - Records
 *
 *     parameters:
 *       - in: query
 *         name: idDocument
 *         required: false
 *         schema:
 *           type: string
 *         description: Documento identificativo del paciente
 *         example: "12345678Z"
 *
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha inicial del rango de búsqueda
 *
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha final del rango de búsqueda
 *
 *       - in: query
 *         name: recordType
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - consulta_ambulatoria
 *             - ingreso_hospitalario
 *         description: Tipo de registro clínico
 *
 *     responses:
 *       200:
 *         description: Lista de registros clínicos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Record'
 *
 *       400:
 *         description: Parámetros inválidos
 *
 *       404:
 *         description: No se encontraron registros
 *
 *       500:
 *         description: Error interno del servidor
 */
recordRouter.get("/records", async (req, res) => {
  try {
    const { idDocument, startDate, endDate, recordType } = req.query;
    validateGetData(idDocument, startDate, endDate, recordType);
    if (idDocument) {
      const patientId = await getPatientID(idDocument as any);
      const records = await Record.find({ patient: patientId }).sort({
        admissionDateTime: 1,
      });
      if (records.length === 0) {
        return res.status(404).send({ error: "No se encontraron registros" });
      }
      return res.send(records);
    }
    const filter: any = {
      admissionDateTime: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      },
    };
    if (recordType) filter.recordType = recordType;
    const records = await Record.find(filter).sort({ admissionDateTime: 1 });
    if (records.length === 0) {
      return res.status(404).send({ error: "No se encontraron registros" });
    }
    res.send(records);
  } catch (error: unknown) {
    if (error instanceof ValidationErrors) {
      return res
        .status(error.statusCode)
        .send({ error: error.message, details: error.errors });
    }
    return res.status(500).send({ error: "Error interno del servidor" });
  }
});

/**
 * @swagger
 * /records/patient:
 *   get:
 *     summary: Obtener registros clínicos de un paciente
 *     description: |
 *       Devuelve todos los registros clínicos asociados a un paciente
 *       utilizando su documento identificativo o número de seguridad social.
 *       
 *       Los resultados se devuelven ordenados cronológicamente.
 *     tags:
 *       - Records
 *     parameters:
 *       - in: query
 *         name: idNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Documento identificativo o número de seguridad social del paciente
 *         example: "12345678Z"
 *
 *     responses:
 *       200:
 *         description: Lista de registros clínicos del paciente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Record'
 *
 *       400:
 *         description: Parámetro idNumber inválido o ausente
 *
 *       404:
 *         description: No se encontraron registros o paciente inexistente
 *
 *       500:
 *         description: Error interno del servidor
 */
recordRouter.get("/records/patient", async (req, res) => {
  try {
    const idDocument = req.query.idNumber;
    if (!idDocument || typeof idDocument !== "string") {
      return res.status(400).send({ error: "El parámetro idNumber es requerido y debe ser string" });
    }
    const patientId = await getPatientID(idDocument);
    const records = await Record.find({ patient: patientId }).sort({
      admissionDateTime: 1,
    });
    if (records.length === 0) {
      return res.status(404).send({ error: "No se encontraron registros" });
    }
    return res.send(records);
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).send({ error: error.message });
    }
    return res.status(500).send({ error: "Error interno del servidor" });
  }
});

/**
 * @swagger
 * /records/{id}:
 *   get:
 *     summary: Obtener un registro clínico por ID
 *     description: |
 *       Devuelve un registro clínico concreto utilizando
 *       su identificador único en MongoDB.
 *     tags:
 *       - Records
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador único del registro clínico
 *         example: "684a1234abcd5678ef901299"
 *
 *     responses:
 *       200:
 *         description: Registro clínico encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *
 *       400:
 *         description: ID inválido
 *
 *       404:
 *         description: Registro clínico no encontrado
 *
 *       500:
 *         description: Error interno del servidor
 */
recordRouter.get("/records/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ error: "ID invalido" });
    }
    const record = await Record.findById(id);
    if (!record) {
      return res.status(404).send({ error: "No se encontro el registro" });
    }
    res.send(record);
  } catch {
    res.status(500).send({ error: "Error interno del servidor" });
  }
});

/**
 * @swagger
 * /records/{id}:
 *   patch:
 *     summary: Modificar un registro clínico
 *     description: |
 *       Permite modificar parcialmente un registro clínico existente.
 *
 *       Si se modifica la lista de medicamentos:
 *       - Se restaura el stock anterior.
 *       - Se verifica disponibilidad de los nuevos medicamentos.
 *       - Se descuenta el nuevo stock.
 *       - Se recalcula automáticamente el importe total.
 *
 *       También permite modificar:
 *       - Paciente
 *       - Médico responsable
 *       - Tipo de registro
 *       - Fechas
 *       - Diagnóstico
 *       - Estado
 *       - Motivo
 *       
 *       El paciente y el médico deben enviarse mediante:
 *       - Documento identificativo
 *       - Número de colegiado
 *       
 *       No mediante ObjectId.
 *     tags:
 *       - Records
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador único del registro clínico
 *         example: "684a1234abcd5678ef901299"
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecordInput'
 *
 *     responses:
 *       200:
 *         description: Registro clínico actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *
 *       400:
 *         description: Error de validación o cuerpo inválido
 *
 *       403:
 *         description: Médico inactivo o medicamento caducado
 *
 *       404:
 *         description: Registro, paciente, médico o medicamento no encontrado
 *
 *       409:
 *         description: Conflicto de stock insuficiente
 *
 *       500:
 *         description: Error interno del servidor
 */
recordRouter.patch("/records/:id", async (req, res) => {
  const rollback1: RollbackMedication[] = [];
  const rollback2: RollbackMedication[] = [];
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ error: "ID invalido" });
    }
    const record = await Record.findById(id);
    if (!record) {
      return res.status(404).send({ error: "No se encontro el registro" });
    }
    validatePatchBody(req.body);
    const {
      idDocument,
      medicalLicense,
      medicationList,
      recordType,
      admissionDateTime,
      dischargeDateTime,
      reason,
      diagnosis,
      recordStatus,
    } = req.body;
    const errors: string[] = [];
    if (idDocument) validateString(idDocument, errors, true);
    if (medicalLicense) validateString(medicalLicense, errors, false);
    if (errors.length > 0) throw new ValidationErrors(errors);
    validatePatchDates(
      record,
      admissionDateTime,
      dischargeDateTime,
      recordStatus,
    );
    let prescribedMedications;
    let amount;
    if (medicationList) {
      validateArray(medicationList, errors);
      if (errors.length > 0) throw new ValidationErrors(errors);
      getRollback(record.prescribedMedications, rollback1);
      await updateMedicationStock(rollback1, 1);
      ({ prescribedMedications, amount } = await processMedications(
        medicationList,
        rollback2,
      ));
    }
    if (idDocument) record.patient = await getPatientID(idDocument);
    if (medicalLicense)
      record.responsibleStaff = await getStaffID(medicalLicense);
    if (recordType) record.recordType = recordType;
    if (admissionDateTime)
      record.admissionDateTime = new Date(admissionDateTime);
    if (recordStatus) record.recordStatus = recordStatus;
    if (reason) record.reason = reason;
    if (diagnosis) record.diagnosis = diagnosis;
    if (prescribedMedications)
      record.prescribedMedications = prescribedMedications;
    if (amount !== undefined) record.amount = amount;
    if (record.recordStatus === "abierto") record.dischargeDateTime = undefined;
    else {
      if (dischargeDateTime) {
        record.dischargeDateTime = new Date(dischargeDateTime);
      } else if (!record.dischargeDateTime) {
        record.dischargeDateTime = new Date();
      }
    }
    await record.save();
    res.send(record);
  } catch (error: unknown) {
    if (rollback2.length > 0) {
      try {
        await updateMedicationStock(rollback2, 1);
      } catch (rollbackError) {
        console.error(rollbackError);
      }
    }
    if (rollback1.length > 0) {
      try {
        await updateMedicationStock(rollback1, -1);
      } catch (rollbackError) {
        console.error(rollbackError);
      }
    }
    if (error instanceof ValidationErrors) {
      return res
        .status(error.statusCode)
        .send({ error: error.message, details: error.errors });
    } else if (error instanceof AppError) {
      return res.status(error.statusCode).send({ error: error.message });
    } else if (error instanceof Error && error.name === "ValidationError") {
      return res.status(400).send({ error: error.message });
    }
    return res.status(500).send({ error: "Error interno del servidor" });
  }
});

/**
 * @swagger
 * /records/{id}:
 *   delete:
 *     summary: Eliminar un registro clínico
 *     description: |
 *       Elimina un registro clínico utilizando su identificador único.
 *
 *       Antes de eliminar el registro:
 *       - Se restaurará automáticamente el stock de todos los medicamentos
 *         prescritos en el registro.
 *
 *       Esta operación se interpreta como una cancelación o corrección
 *       administrativa del historial clínico.
 *     tags:
 *       - Records
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador único del registro clínico
 *         example: "684a1234abcd5678ef901299"
 *
 *     responses:
 *       200:
 *         description: Registro clínico eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *
 *       400:
 *         description: ID inválido
 *
 *       404:
 *         description: Registro clínico no encontrado
 *
 *       500:
 *         description: Error interno del servidor
 */
recordRouter.delete("/records/:id", async (req, res) => {
  const rollback1: RollbackMedication[] = [];
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ error: "ID invalido" });
    }
    const record = await Record.findById(id);
    if (!record) {
      return res.status(404).send({ error: "No se encontro el registro" });
    }
    getRollback(record.prescribedMedications, rollback1);
    await updateMedicationStock(rollback1, 1);
    await record.deleteOne();
    res.send(record);
  } catch {
    if (rollback1.length > 0) {
      try {
        await updateMedicationStock(rollback1, -1);
      } catch (rollbackError) {
        console.error(rollbackError);
      }
      return res.status(500).send({ error: "Error interno del servidor" });
    }
  }
});
