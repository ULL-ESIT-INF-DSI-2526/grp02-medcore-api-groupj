import { MedicationInput } from "../../../types/consultas/medicationInput.js";
import { PrescribedMedication } from "../../../types/consultas/prescribedMedication.js";
import {getIDMedicationList} from "./getIDMedicationList.js"
import { NotFoundError } from "../error/notFoundError.js";

export async function processMedications( medicationList: MedicationInput[]): Promise<PrescribedMedication[]> {
  const medicationMap = await getIDMedicationList(medicationList);
  const prescribedMedications: PrescribedMedication[] = [];
  for (const medication of medicationList) {
    const medicationID = medicationMap.get(medication.nationalCode);
    if (medicationID) { 
      prescribedMedications.push({
        medication: medicationID,
        units: medication.units,
        posology: medication.posology
      });
    }
    else
      throw new NotFoundError(`No se encontró el medicamento con código nacional ${medication.nationalCode}`);
  }

  return prescribedMedications;
}