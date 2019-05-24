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
  unauthenticated: ['Unauthenticated.', 401],
  unauthorized: ['Unauthorized.', 403],
  notFound: ['Not Found.', 404],
  timeout: ['Timeout Error.', 460],
  badRequest: ['Bad Request.', 405],
  badResponse: ['Bad Response.', 405],
  noResponse: ['No Response.', 406],
  internal: ['Internal Error.', 500],
};

Object.entries(errors)
  .forEach(([key, [message, code]]) => {
    ServiceError[key] = (msg = message, cd = code, data) => new ServiceError(msg, cd, data);
  });

module.exports = ServiceError;
