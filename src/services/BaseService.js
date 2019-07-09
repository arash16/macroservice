class BaseService {
  constructor(app = {}) {
    this.app = app;
  }

  created() {}

  starting() {}

  started() {}

  stopping() {}

  stopped() {}

  applyMiddlewares(actionDef, middlewares, type) {
    if (!Array.isArray(middlewares)) return;

    for (let i = middlewares.length - 1; i >= 0; i -= 1) {
      const m = middlewares[i];
      if (m[type]) {
        actionDef.handler = m[type](actionDef, this) || actionDef.handler;
      }
    }
  }

  parseArgs(action, params, context) {
    if (!params || typeof params !== 'object') {
      const id = params;
      params = {};
      if (id != null) params.id = id;
    }
    params.action = action;

    if (!context || typeof context !== 'object') context = {};
    context.app = this.app;
    context.service = this;

    return { params, context };
  }
}

module.exports = BaseService;

// TODO: middleware for localAction, remoteAction
