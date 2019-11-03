const ServiceError = require('../ServiceError');

module.exports = async function withTimeout(callback, timeout, onTimeout) {
  // eslint-disable-next-line
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

      reject(new ServiceError.Timeout());
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
