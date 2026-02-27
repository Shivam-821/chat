class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public success: boolean = false,
    public errors: any[] = [],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = success;
    this.errors = errors;
  }
}

export { ApiError };
