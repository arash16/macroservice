const BaseService = require('./BaseService');
const ServiceError = require('../ServiceError');

class MicroService extends BaseService {
  constructor(service, app) {
    super(app);
    Object.assign(this, service);

    this.actions = {};
    Object.entries(service.actions || {})
      .forEach(([name, handler]) => {
        const actionDef = typeof handler === 'function' ? { name, handler } : { name, ...handler };
        this.applyMiddlewares(actionDef, service.middlewares, 'local');
        this.applyMiddlewares(actionDef, this.app.middlewares, 'local');
        this.actions[name] = actionDef;
      });

    this.created();
  }

  async call(...args) {
    const { params, context } = this.parseArgs(...args);
    const action = this.actions[params.action];
    if (!action) {
      throw ServiceError.notFound();
    }

    const { handler, tcp } = action;
    if (tcp === false && context.caller === 'tcp') {
      throw new Error('Not allowed!');
    }

    context.result = await handler.call(this, params, context);
    return context.result;
  }
}

module.exports = MicroService;
