import { Types } from "mongoose";

/**
 * Representa un medicamento utilizado en operaciones de rollback
 * para restaurar el stock tras errores durante transacciones lógicas.
 */
export type RollbackMedication = {
  medication: Types.ObjectId;
  units: number;
}