import { AppError } from "./appError.js";

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}