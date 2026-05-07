import express from "express";
import mongoose from "mongoose";
import { validateMainData } from "../utils/records/validate/validateMainData.js";
import { processMedications } from "../utils/records/id/processMedications.js";
import { getPatientID } from "../utils/records/id/getPatientID.js";
import { getStaffID } from "../utils/records/id/getStaffID.js";


export const recordRouter = express.Router();

recordRouter.post("/record", async (req, res) => {
  try {
    const {idDocument, medicalLicense, medicationList} = req.body;
    validateMainData(idDocument, medicalLicense, medicationList);
    const patient = await getPatientID(idDocument);
    const responsibleStaff = await getStaffID(medicalLicense);
    const prescribedMedications = await processMedications(medicationList);
  }
  catch {

  }
})