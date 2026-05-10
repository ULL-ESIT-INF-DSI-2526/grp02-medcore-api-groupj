/**
 * Tipos válidos de registros clínicos.
 */
export const RECORD_TYPE = [
  "consulta_ambulatoria",
  "ingreso_hospitalario"
] as const;

/**
 * Tipo unión derivado de los tipos válidos de registros clínicos.
 */
export type RecordType = typeof RECORD_TYPE[number];