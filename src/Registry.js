class Registry {
  constructor() {
    this._services = {};
  }

  register(name, service) {
    this._services[name] = service;
    service.name = name;
    return service;
  }

  unregister(name) {
    const result = this._services[name];
    delete this._services[name];
    return result;
  }

  services() {
    return Object.keys(this._services);
  }

  service(name) {
    return this._services[name];
  }
}

module.exports = Registry;
