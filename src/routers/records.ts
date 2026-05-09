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
      if (error.message.includes("duplicate key")) {
        return res.status(409).send({ error: error.message });
      } else if (error.name === "ValidationError") {
        return res.status(400).send({ error: error.message });
      }
    }
    return res.status(500).send({ error: "Error interno del servidor" });
  }
});

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
    if (error instanceof ValidationErrors) {
      return res
        .status(error.statusCode)
        .send({ error: error.message, details: error.errors });
    }
    return res.status(500).send({ error: "Error interno del servidor" });
  }
});

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
