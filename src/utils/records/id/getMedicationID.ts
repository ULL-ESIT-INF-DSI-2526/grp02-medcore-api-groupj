import { MedicationInput } from "../../../types/consultas/medicationInput.js";
import { MedicationOutput } from "../../../types/consultas/medicationOutput.js";
import { ConflictError } from "../error/conflictError.js";
import { NotFoundError } from "../error/notFoundError.js";
import { Medication } from "../../../models/medications.js";

export async function getMedicationID(medicationList: MedicationInput[]) {
  const newMedicationList = mergeMedications(medicationList);
  const idMedicationList: MedicationOutput[] = [];
  for (const item of newMedicationList) {
    const med = await Medication.findOne ({codigoNacional: item.nacionalCode});
    if (!med) throw new NotFoundError(`No se encontro el medicamento con código nacional ${item.nacionalCode}`);
    else if (med.stockDisponible < item.amount) 
      throw new ConflictError(`No hay suficiente stock para el medicamento con código nacional ${item.nacionalCode}`);
    else {
      const medID: MedicationOutput = {
        ID: med._id,
        amount: item.amount
      } 
      idMedicationList.push(medID);
    }
  }
}

function mergeMedications(medicationList: MedicationInput[]): MedicationInput[] {
  const medicationMap = new Map<string, number>();
  for (const medication of medicationList) {
    const current = medicationMap.get(medication.nacionalCode) || 0;
    medicationMap.set(medication.nacionalCode, current + medication.amount);
  }
  return Array.from(
    medicationMap,
    ([nacionalCode, amount]) => ({
      nacionalCode,
      amount
    })
  );
}