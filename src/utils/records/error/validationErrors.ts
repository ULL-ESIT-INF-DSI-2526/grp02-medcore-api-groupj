export class ValidationErrors extends Error {
  errors: string[];
  statusCode: number;
  constructor(errors: string[]) {
    super("Validation failed");
    this.errors = errors;
    this.statusCode = 400;
  }
}