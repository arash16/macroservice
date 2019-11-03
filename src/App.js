const BaseService = require('./services/BaseService');
const MicroService = require('./services/MicroService');
const ServiceProxy = require('./services/ServiceProxy');
const ConfigStore = require('./ConfigStore');
const Registry = require('./Registry');
const Server = require('./Server');


class App {
  constructor(options) {
    ConfigStore.mixin(this);
    this.registry = new Registry(this);
    this.middlewares = options.middlewares || [
      require('./middlewares/httpBodyParser'),
      // TODO: jwt & auth
      // TODO: httpFileUpload
      // TODO: validate and convert params
      require('./middlewares/actionHooks'),
      // TODO: retry
      // TODO: timeout (possibly distributed timeout)
      // TODO: metrics
      // TODO: fallback
      // TODO: short circuit
      // TODO: emergency cache
    ];

    if (options.config) {
      this.loadConfig(options.config);
    }

    this._servers = [];
    for (const svcConfig of options.services) {
      this.register(svcConfig);
    }
  }

  register(svcConfig) {
    if (typeof svcConfig === 'function') {
      svcConfig = svcConfig(this);
    }

    const { name, publish } = svcConfig;
    if (this.service(name)) {
      throw new Error(`Service '${name}' already registered`);
    }

    const svc = this._buildService(svcConfig);
    this._buildServer(name, publish, svc);
    this.registry.register(name, svc);
  }

  async unregister(svcName) {
    await this.stop(svcName);
    this._servers = this._servers.filter(s => s.name !== svcName);
    return this.registry.unregister(svcName);
  }

  _buildServer(name, publish, svc) {
    if (!publish) return;
    if (Array.isArray(publish)) {
      for (const p of publish) {
        this._buildServer(name, p, svc);
      }
      return;
    }

    this._servers.push(new Server(svc, publish));
  }

  _buildService(service) {
    if (service instanceof BaseService) {
      return service;
    }

    if (typeof service.remote === 'string') {
      // we have to call from remote service
      // we only use service object to know action methods
      return new ServiceProxy(service, this);
    }

    if (!service || typeof service !== 'object') {
      throw new Error('Invalid service definition provided.');
    }

    return new MicroService(service, this);
  }

  service(name) {
    return this.registry.service(name);
  }

  start(...args) {
    const servers = args.length
      ? this._servers.filter(s => args.indexOf(s.name) >= 0)
      : this._servers;

    return Promise.all(servers.map(s => s.start()));
  }

  stop(...args) {
    const servers = args.length
      ? this._servers.filter(s => args.indexOf(s.name) >= 0)
      : this._servers;
    return Promise.all(servers.map(s => s.stop()));
  }
}

module.exports = App;
