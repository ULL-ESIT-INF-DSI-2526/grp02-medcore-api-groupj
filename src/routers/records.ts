import express from "express";
import mongoose from "mongoose";
import { Record } from "../models/records.js";
import { validateMainData } from "../utils/records/validate/validateMainData.js";
import { validateDates } from "../utils/records/validate/validateDate.js";
import { validateGetData } from "../utils/records/validate/validateGetData.js";
import { processMedications } from "../utils/records/id/processMedications.js";
import { RollbackMedication } from "../types/consultas/rollbackMedication.js";
import { AppError } from "../utils/records/error/appError.js";
import { ValidationErrors } from "../utils/records/error/validationErrors.js";
import { getPatientID } from "../utils/records/id/getPatientID.js";
import { getStaffID } from "../utils/records/id/getStaffID.js";
import { rollbackMedicationStock } from "../utils/records/rollback/rollbackMedicationStock.js";


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
      recordStatus } = req.body;
    validateMainData(idDocument, medicalLicense, medicationList);
    validateDates(admissionDateTime, dischargeDateTime, recordStatus);
    const patient = await getPatientID(idDocument);
    const responsibleStaff = await getStaffID(medicalLicense);
    const { prescribedMedications, amount} = await processMedications(medicationList, rollback);
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
      recordStatus
    });
    await record.save();
    res.status(201).send(record);
  }
  catch (error: unknown) {
    if (rollback.length > 0) {
      try { await rollbackMedicationStock(rollback);}
      catch (rollbackError) { console.error(rollbackError);}
    }
    if (error instanceof ValidationErrors) {
      return res.status(error.statusCode).send({error: error.message, details: error.errors});
    }
    else if (error instanceof AppError) {
      return res.status(error.statusCode).send({error: error.message});
    }
    else if (error instanceof Error) {
      if (error.message.includes("duplicate key")) { 
        return res.status(409).send({error: error.message});
      }
      else if (error.name === "ValidationError") {
        return res.status(400).send({error: error.message});
      }
    }
    return res.status(500).send({error: "Error interno del servidor"});
  }
})

recordRouter.get("/records", async (req, res) => {
  try {
    const {idDocument, startDate, endDate, recordType} = req.query;
    validateGetData(idDocument, startDate, endDate, recordType);
    if (idDocument) {
      const patientId = await getPatientID(idDocument as any);
      const records = await Record.find({ patient: patientId}).sort({ admissionDateTime: 1});
      if (records.length === 0) {
        return res.status(404).send({error: "No se encontraron registros"});
      }
      return res.send(records);
    }
    const filter: any = {
      admissionDateTime: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
    };
    if (recordType) filter.recordType = recordType;
    const records = await Record.find(filter).sort({admissionDateTime: 1});
    if (records.length === 0) {
      return res.status(404).send({error: "No se encontraron registros"});
    }
    res.send(records);
  }
  catch (error: unknown) {
    if (error instanceof ValidationErrors) {
      return res.status(error.statusCode).send({error: error.message, details: error.errors});
    }
    return res.status(500).send({error: "Error interno del servidor"});
  }
})