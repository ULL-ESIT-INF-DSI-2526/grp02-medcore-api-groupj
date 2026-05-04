export const SHIFTS = [
  "mañana",
  "tarde",
  "noche",
  "rotatorio"
] as const;

export type Shift = typeof SHIFTS[number];