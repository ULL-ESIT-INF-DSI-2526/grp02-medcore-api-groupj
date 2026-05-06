export const RECORD_TYPE = [
  "consulta_ambulatoria",
  "ingreso_hospitalario"
] as const;

export type RecordType = typeof RECORD_TYPE[number];