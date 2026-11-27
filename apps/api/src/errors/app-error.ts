import type { ApiErrorCode, ApiValidationDetail } from "../contracts/api.js";

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ApiErrorCode,
    message: string,
    public readonly details?: ApiValidationDetail[],
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "AppError";
  }
}

