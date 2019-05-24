const ADDR = 'tcp://127.0.0.1:1337';
const SocketTransport = require('./SocketTransport');
const ServiceError = require('../ServiceError');
const { resolveAfter, withApp } = require('../utils/test-utils');

describe('SocketTransport', () => {
  afterEach(() => sinon.restore());

  it('should call and handle simple requests', () => {
    const result = withApp(
      {
        services: [
          {
            publish: ADDR,
            actions: { test: () => ({ data: 1 }) },
          },
          { name: 'proxy', remote: ADDR },
        ],
      },
      app => app.service('proxy').call('test'),
    );

    return expect(result).to.eventually.be.eql({ data: 1 });
  });

  it('should call and handle large payloads', () => {
    const makePayload = n => Array(n).fill().map(() => Math.random()).join();
    const sendData = makePayload(10000);
    const result = withApp(
      {
        services: [
          {
            publish: ADDR,
            actions: { test: ({ id }) => ({ data: `${id}100` }) },
          },
          { name: 'proxy', remote: ADDR },
        ],
      },
      app => app.service('proxy').call('test', sendData),
    );

    return expect(result).to.eventually.be.eql({ data: `${sendData}100` });
  });

  it('should throw timeout error if responded late', () => {
    const result = withApp(
      {
        services: [
          {
            publish: ADDR,
            actions: {
              test: () => resolveAfter(100, { data: 1 }),
            },
          },
          { name: 'proxy', remote: ADDR },
        ],
      },
      app => app.service('proxy').call('test', {}, { timeout: 50 }),
    );

    return expect(result).to.eventually.be.rejectedWith('Timeout Error');
  });

  it('should throw original error thrown inside remote handler', () => {
    const result = withApp(
      {
        services: [
          {
            publish: ADDR,
            actions: { test() { throw new Error('some'); } },
          },
          { name: 'proxy', remote: ADDR },
        ],
      },
      app => app.service('proxy').call('test'),
    );

    return expect(result).to.eventually.be.rejectedWith('some');
  });

  it('should throw service errors (thrown inside remote handler) as is', () => {
    const result = withApp(
      {
        services: [
          {
            publish: ADDR,
            actions: { test() { throw ServiceError.notFound('some'); } },
          },
          { name: 'proxy', remote: ADDR },
        ],
      },
      app => app.service('proxy').call('test'),
    );

    return expect(result).to.eventually.be.rejectedWith('some');
  });

  it('should throw `excessive data` with bad buffer input formats', () => {
    sinon.replace(SocketTransport._utils, 'numToBuffer', () => Buffer.from([0, 0, 0, 0, 0, 0, 1]));
    const result = withApp(
      {
        services: [
          {
            publish: ADDR,
            actions: { test() { throw ServiceError.notFound('some'); } },
          },
          { name: 'proxy', remote: ADDR },
        ],
      },
      app => app.service('proxy').call('test'),
    );

    return expect(result).to.eventually.be.rejectedWith('Excessive data received.');
  });
});
