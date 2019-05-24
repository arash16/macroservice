class Registry {
  constructor() {
    this._services = {};
  }

  register(name, service) {
    this._services[name] = service;
    service.name = name;
  }

  services() {
    return Object.keys(this._services);
  }

  service(name) {
    return this._services[name];
  }
}

module.exports = Registry;
