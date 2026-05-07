import { ValidationErrors } from "../error/validationErrors.js";
import { validateString } from "./validateString.js";
import { validateArray } from "./validateArray.js";

export function validateMainData(idDocument: unknown, 
                                  medicalLicense: unknown, 
                                  medicationList: unknown): void
{
  const errors: string[] = [];
  validateString(idDocument, errors, true);
  validateString(medicalLicense, errors, false);
  validateArray(medicationList, errors);
  if (errors.length > 0) throw new ValidationErrors(errors);
}