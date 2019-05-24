const ServiceError = require('../ServiceError');

module.exports = async function withTimeout(callback, timeout, onTimeout) {
  return new Promise(async (resolve, reject) => {
    const prom = callback();

    const timer = setTimeout(() => {
      if (prom && typeof prom.cancel === 'function') {
        prom.cancel();
      }

      if (typeof onTimeout === 'function') {
        const result = onTimeout();
        if (result !== undefined) {
          resolve(result);
          return;
        }
      }

      reject(ServiceError.timeout());
    }, timeout);

    try {
      resolve(await prom);
    } catch (e) {
      reject(e);
    } finally {
      clearTimeout(timer);
    }
  });
};
