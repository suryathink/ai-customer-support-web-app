import HttpStatusCodes from "@src/constants/HttpStatusCodes";

/**
 * Error with an HTTP status that is safe to show to the client.
 */
export class ApiError extends Error {
  public readonly statusCode: HttpStatusCodes;

  constructor(statusCode: HttpStatusCodes, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
