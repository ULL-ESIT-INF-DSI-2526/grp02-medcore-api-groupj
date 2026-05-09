import { PrescribedMedication } from "../../../types/consultas/prescribedMedication.js";
import { RollbackMedication } from "../../../types/consultas/rollbackMedication.js";

export function getRollback (medicationList: PrescribedMedication[], rollback: RollbackMedication[]): void {
  for (const medication of medicationList) {
    rollback.push({
      medication: medication.medication, 
      units: medication.units
    });
  }
}