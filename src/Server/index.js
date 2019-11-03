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
    if (!this._started && !this._starting) {
      this._starting = true;
      await this._service.starting();
      await this._server.listen(this._address);
      this._started = true;
      await this._service.started();
      this._starting = false;
    }
  }

  async stop() {
    if (this._started && !this._stopping) {
      this._stopping = true;
      await this._service.stopping();
      await this._server.close();
      this._started = false;
      await this._service.stopped();
      this._stopping = false;
    }
  }
}

module.exports = Server;
