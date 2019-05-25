class ServiceError extends Error {
  constructor(message, code, data = {}) {
    let stack;
    if (typeof message === 'object') {
      data = message.data;
      code = message.code;
      stack = message.stack;
      message = message.message;
    }

    super(message);
    this.code = code;
    this.data = data;

    if (stack) {
      this.stack = stack;
    }
  }

  toJSON() {
    return {
      ...this.data,
      code: this.code,
      message: this.message,
      stack: process.env.NODE_ENV !== 'production' ? this.stack : undefined,
    };
  }
}

const errors = {
  BadRequest: ['BadRequest', 400],
  NotAuthenticated: ['NotAuthenticated', 401],
  PaymentError: ['PaymentError', 402],
  Forbidden: ['Forbidden', 403],
  NotFound: ['NotFound', 404],
  MethodNotAllowed: ['MethodNotAllowed', 405],
  NotAcceptable: ['NotAcceptable', 406],
  Timeout: ['Timeout', 408],
  Conflict: ['Conflict', 409],
  LengthRequired: ['LengthRequired', 411],
  Unprocessable: ['Unprocessable', 422],
  TooManyRequests: ['TooManyRequests', 429],
  GeneralError: ['GeneralError', 500],
  NotImplemented: ['NotImplemented', 501],
  BadGateway: ['BadGateway', 502],
  Unavailable: ['Unavailable', 503],
};

Object.entries(errors)
  .forEach(([key, [message, code]]) => {
    ServiceError[key] = class SpecificServiceError extends ServiceError {
      constructor(msg = message, cd = code, data) {
        super(msg, cd, data);
      }
    };

    ServiceError[code] = ServiceError[key];
  });

module.exports = ServiceError;
