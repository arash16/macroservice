const ServiceError = require('../ServiceError');

class JsonSerializer {
  encode(val) {
    try {
      return Buffer.from(JSON.stringify(val));
    } catch (e) {
      throw ServiceError.badResponse(e.message);
    }
  }

  decode(buf) {
    try {
      return JSON.parse(buf.toString());
    } catch (e) {
      throw ServiceError.badRequest(e.message);
    }
  }
}

module.exports = JsonSerializer;
