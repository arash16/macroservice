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

    this._servers = [];
    for (const svc of options.services) {
      const {
        name,
        publish,
      } = svc;

      this.registry.register(name, this._buildService(svc));
      this._buildServer(name, publish);
    }
  }

  _buildServer(name, publish) {
    if (!publish) return;
    if (Array.isArray(publish)) {
      for (const p of publish) {
        this._buildServer(name, p);
      }
      return;
    }

    this._servers.push(new Server(this.service(name), publish));
  }

  _buildService(service) {
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

  stop() {
    return Promise.all(this._servers.map(server => server.stop()));
  }
}

module.exports = App;
