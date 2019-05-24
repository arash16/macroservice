const net = require('net');
const parseAddress = require('../utils/parseAddress');
const SocketTransport = require('../transports/SocketTransport');


class SocketServer {
  constructor(service) {
    this.transport = new SocketTransport();

    this.service = service;
    this._server = net.createServer(this._handler.bind(this));
  }

  async listen(address) {
    await new Promise((resolve, reject) => {
      this._server.once('error', reject);
      this._server.once('listening', resolve);
      this._server.listen(parseAddress(address));
    });
  }

  close() {
    return new Promise(resolve => this._server.close(resolve));
  }

  _handler(socket) {
    this.transport.handle(socket, params => this.service.call(params.action, params, { caller: 'tcp' }));
  }
}

module.exports = SocketServer;
