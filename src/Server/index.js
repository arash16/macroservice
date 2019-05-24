const SocketServer = require('./SocketServer');
const HTTPServer = require('./HTTPServer');

const servers = {
  tcp: SocketServer,
  ipc: SocketServer,
  http: HTTPServer,
};

class Server {
  constructor(service, address) {
    this._service = service;
    this._address = address;

    const schema = address.substring(0, address.indexOf(':'));
    this._server = new servers[schema](service);
  }

  get name() {
    return this._service.name;
  }

  async start() {
    await this._service.starting();
    await this._server.listen(this._address);
    await this._service.started();
  }

  async stop() {
    await this._service.stopping();
    await this._server.close();
    await this._service.stopped();
  }
}

module.exports = Server;
