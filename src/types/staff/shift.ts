export const SHIFTS = [
  "manana",
  "tarde",
  "noche",
  "rotatorio"
] as const;

export type Shift = typeof SHIFTS[number];