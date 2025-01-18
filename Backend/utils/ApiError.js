class ApiError extends Error {  //We have created a standardized format of recieving errors, If we get errors from API we can use this
  constructor(statusCode, message = "Something went wrong", errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.data = null; //read this from docs
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };