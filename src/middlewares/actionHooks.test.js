/* eslint-disable no-unused-expressions */

const App = require('../App');
const { withApp } = require('../utils/test-utils');

describe('actionHooks', () => {
  it('should throw if a hook is not a function', () => {
    expect(
      () => new App({
        services: [
          {
            actions: { test() {} },
            hooks: { before: { test: [''] } },
          },
        ],
      }),
    ).to.throw('Invalid hook');
  });

  it('should throw if a hooks is not a object', () => {
    expect(
      () => new App({
        services: [
          {
            actions: { test() {} },
            hooks: '',
          },
        ],
      }),
    ).to.throw('Invalid hooks');
  });

  it('should call non-errored action\'s hooks in expected order', async () => {
    const hc = Array(6).fill().map(() => sinon.stub());
    const hn = Array(2).fill().map(() => sinon.stub());

    const result = await withApp(
      {
        services: [
          {
            name: 'test',
            actions: { test() { return 143; } },
            hooks: {
              before: { test: hc.slice(0, 2) },
              after: { test: hc.slice(2, 4) },
              error: { test: hn }, // not called
              finally: { test: hc.slice(4, 6) },
            },
          },
        ],
      },
      app => app.service('test').call('test'),
    );
    expect(result).to.be.eql(143);
    for (let i = 1; i < 6; i += 1) {
      expect(hc[i]).to.be.calledAfter(hc[i - 1]);
    }

    for (let i = 0; i < 2; i += 1) {
      expect(hn[i]).to.not.be.called;
    }
  });

  it('should call errored action\'s hooks in expected order', async () => {
    const hc = Array(6).fill().map(() => sinon.stub());
    const hn = Array(2).fill().map(() => sinon.stub());

    try {
      await withApp(
        {
          services: [
            {
              name: 'test',
              actions: { test() { throw new Error(); } },
              hooks: {
                before: { test: hc.slice(0, 2) },
                after: { test: hn }, // not called
                error: { test: hc.slice(2, 4) },
                finally: { test: hc.slice(4, 6) },
              },
            },
          ],
        },
        app => app.service('test').call('test'),
      );
    } catch (e) {
      for (let i = 1; i < 6; i += 1) {
        expect(hc[i]).to.be.calledAfter(hc[i - 1]);
      }

      for (let i = 0; i < 2; i += 1) {
        expect(hn[i]).to.not.be.called;
      }

      return;
    }

    throw new Error('should not come here');
  });

  it('should skip rest of hooks in an array if one of them returns SKIP', async () => {
    const hc = Array(6).fill().map(() => sinon.stub());
    const hn = Array(2).fill().map(() => sinon.stub());

    const result = await withApp(
      {
        services: [
          {
            name: 'test',
            actions: { test() { return 143; } },
            hooks: {
              before: { test: [...hc, () => 'SKIP', hn] },
            },
          },
        ],
      },
      app => app.service('test').call('test'),
    );
    expect(result).to.be.eql(143);
    for (let i = 1; i < 6; i += 1) {
      expect(hc[i]).to.be.calledAfter(hc[i - 1]);
    }

    for (let i = 0; i < 2; i += 1) {
      expect(hn[i]).to.not.be.called;
    }
  });

  it('should not run original action if before hook assign `result`', async () => {
    const hn = sinon.stub();
    const result = await withApp(
      {
        services: [
          {
            name: 'test',
            actions: { test: hn },
            hooks: {
              before: { test() { this.result = 143; } },
            },
          },
        ],
      },
      app => app.service('test').call('test'),
    );
    expect(result).to.be.eql(143);
    expect(hn).to.not.be.called;
  });

  it('should extend context with whatever a hook returns', async () => {
    const ctx = {};
    const result = await withApp(
      {
        services: [
          {
            name: 'test',
            actions: { test() { return 143; } },
            hooks: {
              before: { test() { return { x: 1337 }; } },
            },
          },
        ],
      },
      app => app.service('test').call('test', {}, ctx),
    );
    expect(result).to.be.eql(143);
    expect(ctx.x).to.be.eql(1337);
  });
});
