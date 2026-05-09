import { AppError } from "./appError.js";

export class ValidationErrors extends AppError {
  errors: string[];
  constructor(errors: string[]) {
    super("Validation failed", 400);
    this.errors = errors;
  }
}