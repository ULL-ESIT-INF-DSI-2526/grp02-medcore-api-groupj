/**
 * Especialidades médicas válidas para el personal sanitario.
 */
export const MEDICAL_SPECIALTIES = [
  "medicina_general",
  "medicina_interna",
  "cardiologia",
  "dermatologia",
  "endocrinologia",
  "gastroenterologia",
  "hematologia",
  "nefrologia",
  "neumologia",
  "neurologia",
  "oncologia",
  "pediatria",
  "psiquiatria",
  "reumatologia",
  "traumatologia",
  "urologia",
  "ginecologia",
  "oftalmologia",
  "otorrinolaringologia",
  "radiologia",
  "anestesiologia",
  "urgencias",
  "medicina_familiar",
  "geriatria",
  "cirugia_general",
  "medicina_intensiva"
] as const;

/**
 * Tipo unión derivado de las especialidades médicas permitidas.
 */
export type MedicalSpecialty = typeof MEDICAL_SPECIALTIES[number];