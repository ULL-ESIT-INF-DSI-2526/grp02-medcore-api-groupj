/**
 * Estados válidos de un registro clínico.
 */
export const RECORD_STATUS = [
  "abierto",
  "cerrado"
] as const;

/**
 * Tipo unión derivado de los estados válidos del registro clínico.
 */
export type RecordStatus = typeof RECORD_STATUS[number];