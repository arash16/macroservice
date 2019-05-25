const net = require('net');
const ServiceError = require('../ServiceError');
const JsonSerializer = require('./JsonSerializer');
const withTimeout = require('../utils/withTimeout');


const utils = {
  numToBuffer(num) {
    const buf = Buffer.allocUnsafe(6);
    buf.writeUInt32BE(num, 0, 6);
    return buf;
  },

  readDynamicMessage(emitter) {
    return new Promise((resolve, reject) => {
      let len;
      let result;
      let readBytes = -6;

      emitter.on('data', function handler(buf) {
        if (len === undefined) {
          len = buf.readUInt32BE(0);
          result = Buffer.allocUnsafe(len);

          buf.copy(result, 0, 6);
        } else {
          buf.copy(result, readBytes);
        }
        readBytes += buf.length;

        if (readBytes === len) {
          emitter.off('data', handler);
          resolve(result);
        }

        if (readBytes > len) {
          emitter.off('data', handler);
          reject(new ServiceError.BadRequest('Excessive data received.'));
        }
      });
    });
  },
};

class SocketTransport {
  constructor(serializer = new JsonSerializer()) {
    this.serializer = serializer;
  }

  call(address, timeout, request) {
    const client = new net.Socket();
    return new Promise((resolve, reject) => {
      let timer;

      function finishClient(err, result) {
        clearTimeout(timer);
        try { client.destroy(); } catch (e) {}

        if (err) reject(err);
        else resolve(result);
      }

      timer = timeout && setTimeout(
        () => finishClient(new ServiceError.Timeout()),
        timeout,
      );

      client.on('error', finishClient);
      client.connect(address, async () => {
        client.on('close', () => finishClient(new ServiceError.GeneralError()));

        // start listening for response
        const resBufPromise = utils.readDynamicMessage(client);

        // send request
        const reqBuf = this.serializer.encode(request);
        client.write(utils.numToBuffer(reqBuf.length), () => {
          client.write(reqBuf);
        });

        // read response
        try {
          const resBuf = await resBufPromise;
          const { error, result } = this.serializer.decode(resBuf);
          if (result) {
            finishClient(null, result);
          } else {
            finishClient(new ServiceError(error));
          }
        } catch (e) {
          finishClient(e);
        }
      });
    });
  }

  handle(socket, cb) {
    function close() {
      try { socket.destroy(); } catch (e) { }
    }

    // timeout reading request (response timeout is applied with middlewares)
    return withTimeout(
      async () => {
        try {
          const response = await (async () => {
            try {
              const reqBuf = await utils.readDynamicMessage(socket);
              const request = this.serializer.decode(reqBuf);
              return { result: await cb(request) };
            } catch (error) {
              if (error instanceof ServiceError) {
                return { error };
              }
              return {
                error: new ServiceError.GeneralError(
                  error.message,
                  error.code || error.statusCode || error.status,
                  error.data,
                ),
              };
            }
          })();

          const resBuf = this.serializer.encode(response);
          socket.write(utils.numToBuffer(resBuf.length), () => {
            socket.end(resBuf);
          });
        } catch (e) {
          close();
        }
      },
      3000, // TODO: global timeout config for action handling!
      close,
    );
  }
}

SocketTransport._utils = utils;

module.exports = SocketTransport;
