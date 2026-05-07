import { MedicationInput } from "../../../types/consultas/medicationInput.js";
import { MedicationOutput } from "../../../types/consultas/medicationOutput.js";
import { PrescribedMedication } from "../../../types/consultas/prescribedMedication.js";
import { ConflictError } from "../error/conflictError.js";
import { NotFoundError } from "../error/notFoundError.js";
import { Medication } from "../../../models/medications.js";

export async function getMedicationID(medicationList: MedicationInput[]): Promise<PrescribedMedication[]> {
  const newMedicationList = mergeMedications(medicationList);
  const idMedicationList: PrescribedMedication[] = [];
  for (const item of newMedicationList) {
    const med = await Medication.findOne ({codigoNacional: item.nacionalCode});
    if (!med) throw new NotFoundError(`No se encontro el medicamento con código nacional ${item.nacionalCode}`);
    else if (med.stockDisponible < item.units) 
      throw new ConflictError(`No hay suficiente stock para el medicamento con código nacional ${item.nacionalCode}`);
    else {
      const medID: PrescribedMedication = {
        medication: med._id,
        units: item.units,
        posology: item.posology
      } 
      idMedicationList.push(medID);
    }
  }
  return idMedicationList;
}

function mergeMedications(medicationList: MedicationInput[]): MedicationInput[] {
  const medicationMap = new Map<string, MedicationInput>();
  for (const medication of medicationList) {
    const current = medicationMap.get(medication.nacionalCode) || 0;
    if (current) current.units += medication.units;
    else medicationMap.set(medication.nacionalCode, {...medication});
  }
  return Array.from(medicationMap.values());
}