import { AppError } from "./appError.js";

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403);
  }
}