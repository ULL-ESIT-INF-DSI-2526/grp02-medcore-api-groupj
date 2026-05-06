export const RECORD_STATUS = [
  "abierto",
  "cerrado"
] as const;

export type RecordStatus = typeof RECORD_STATUS[number];