const BaseService = require('./BaseService');
const ServiceError = require('../ServiceError');
const { clone } = require('../utils/deep');

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
      throw new ServiceError.NotFound();
    }

    const { handler, tcp } = action;
    if (tcp === false && context.caller === 'tcp') {
      throw new Error('Not allowed!');
    }

    const paramsClone = context.caller ? params : clone(params);
    context.result = await handler.call(this, paramsClone, context);
    return context.result;
  }
}

module.exports = MicroService;
