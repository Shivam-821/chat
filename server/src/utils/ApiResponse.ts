class ApiResponse {
  constructor(
    public statusCode: number,
    public data: any,
    public message: string = "Success",
    public success: boolean = true,
  ) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = success;
  }
}

export { ApiResponse };
