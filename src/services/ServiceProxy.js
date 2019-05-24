const BaseService = require('./BaseService');
const parseAddress = require('../utils/parseAddress');
const TcpTransport = require('../transports/SocketTransport');


class ServiceProxy extends BaseService {
  constructor(service, app) {
    super(app);
    Object.assign(this, service);

    this.transport = new TcpTransport();
    this._options = {
      address: parseAddress(service.remote),
      timeout: 3000,
    };

    this.actions = {};
    this.created();
  }

  async call(...args) {
    const { params, context } = this.parseArgs(...args);

    // TODO: lazy build params.action handler
    if (!this.actions[params.action]) {
      this._makeAction(params.action);
    }

    const { handler } = this.actions[params.action];
    context.result = await handler.call(this, params, context);
    return context.result;
  }

  _makeAction(name) {
    const actionDef = { name, handler: this._handler };
    this.applyMiddlewares(actionDef, this.middlewares, 'remote');
    this.applyMiddlewares(actionDef, this.app.middlewares, 'remote');
    this.actions[name] = actionDef;
  }

  _handler(params, context) {
    return this.transport.call(
      this._options.address,
      context.timeout || this._options.timeout,
      params,
    );
  }
}

module.exports = ServiceProxy;
