const express = require('express');
const helmet = require('helmet');
const parseAddress = require('../utils/parseAddress');

class HTTPServer {
  constructor(service) {
    this.service = service;

    this.express = express();
    this.express.use(helmet());
    this.express.use(this._buildRouter());

    if (service.configureExpress) {
      service.configureExpress(this.express);
    }
  }

  _buildRouter() {
    const { service } = this;
    const router = express.Router();
    Object.values(service.actions)
      .forEach((def) => {
        if (!def.http) return;
        const httpDef = typeof def.http === 'string' ? { path: def.http } : def.http;
        const [, method, path] = /^(\w+)\s+(.*)$/.exec(httpDef.path);

        router[method.toLowerCase()](path, async (req, res) => {
          try {
            const params = { ...req.params };
            const result = await service.call(def.name, params, { caller: 'http', req, res });
            res.json(result);
          } catch (err) {
            const code = err.statusCode || err.status || err.code || 500;
            res
              .status(code)
              .json({
                error: {
                  code,
                  message: err.message,
                  stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
                },
              });
          }
        });
      });

    return router;
  }

  async listen(address) {
    await new Promise((resolve, reject) => {
      this._server = this.express.listen(parseAddress(address));
      this._server.once('listening', resolve);
      this._server.once('error', reject);
    });
  }

  close() {
    return new Promise(resolve => this._server.close(resolve));
  }
}

module.exports = HTTPServer;
