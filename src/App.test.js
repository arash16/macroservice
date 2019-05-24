const { withApp } = require('./utils/test-utils');
const App = require('./App');

const ADDR = 'tcp://127.0.0.1:1337';

describe('App', () => {
  it('should throw with invalid service definition', () => {
    expect(() => new App({
      services: ['service def can only be a object'],
    })).to.throw('Invalid service definition');
  });

  it('should publish multiple addresses when instructed to', () => {
    const result = withApp(
      {
        services: [
          {
            publish: [ADDR, ADDR + 1],
            actions: { test() { return 1; } },
          },
          { name: 'proxy1', remote: ADDR },
          { name: 'proxy2', remote: ADDR + 1 },
        ],
      },
      app => Promise.all([
        app.service('proxy1').call('test'),
        app.service('proxy2').call('test'),
      ]),
    );

    return expect(result).to.eventually.be.eql([1, 1]);
  });

  it('should start only specified services', async () => {
    const app = new App({
      services: [
        { name: 's1', publish: ADDR, actions: { test() { return 143; } } },
        { name: 's2', publish: ADDR + 1, actions: { test() { return 143; } } },
        { name: 'p1', remote: ADDR },
        { name: 'p2', remote: ADDR + 1 },
      ],
    });

    try {
      await app.start('s1');
      return await Promise.all([
        expect(app.service('p1').call('test')).to.eventually.be.eql(143),
        expect(app.service('p2').call('test')).to.eventually.be.rejected,
      ]);
    } finally {
      await app.stop();
    }
  });
});
