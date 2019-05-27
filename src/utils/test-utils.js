function resolveAfter(timeout, val) {
  return new Promise(resolve => {
    setTimeout(() => resolve(val), timeout);
  });
}

const App = require('../App');

async function withApp(config, callback) {
  const app = new App(config);
  try {
    await app.start();
    return await callback(app);
  } finally {
    await app.stop();
  }
}

module.exports = {
  resolveAfter,
  withApp,
};
