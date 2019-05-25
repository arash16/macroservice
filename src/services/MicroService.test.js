const MicroService = require('./MicroService');

describe('MicroService', () => {
  describe('constructor', () => {
    it('should add service name and version to itself', () => {
      const ms = new MicroService({ name: 'sample', version: 2 }, {});
      expect(ms.name).to.eql('sample');
      expect(ms.version).to.eql(2);
    });

    it('should convert action functions to properties with a handler', () => {
      const sampleAction = () => {};
      const ms = new MicroService({ actions: { sampleAction } });

      expect(ms.actions.sampleAction.handler).to.eql(sampleAction);
      expect(ms.actions.sampleAction.name).to.eql('sampleAction');
    });

    it('should apply middlewares in reverse order', async () => {
      const fakeMiddleware = () => ({ local: sinon.spy((_, { handler }) => handler) });
      const middlewares = Array(8).fill().map(fakeMiddleware);

      const app = {
        middlewares: middlewares.slice(0, 4),
      };

      const sample = sinon.fake.returns(13);
      /* eslint-disable-next-line */
      new MicroService({
        middlewares: middlewares.slice(4, 8),
        actions: { sample },
      }, app);

      for (let i = 1; i < middlewares.length; i += 1) {
        expect(middlewares[i].local).to.have.been.calledBefore(middlewares[i - 1].local);
      }
    });
  });

  describe('call', () => {
    it('should call action handler with params and context', async () => {
      const sample = sinon.fake.returns(13);
      const ms = new MicroService({ actions: { sample } });
      expect(await ms.call('sample', 12)).to.eql(13);
      expect(sample.args[0][0]).to.deep.eql({ action: 'sample', id: 12 });
      expect(sample.args[0][1].service).to.eql(ms);
    });

    it('should call action middlewares then app middlewares in consecutive order', () => {
      const fakeMiddleware = () => {
        const result = {
          local: (_, { handler }) => {
            result.spy = sinon.spy(handler);
            return result.spy;
          },
        };
        return result;
      };

      const middlewares = Array(8).fill().map(fakeMiddleware);
      const app = {
        middlewares: middlewares.slice(0, 4),
      };

      const sample = sinon.fake.returns(13);
      const ms = new MicroService({
        middlewares: middlewares.slice(4, 8),
        actions: { sample },
      }, app);

      ms.call('sample');

      for (let i = 1; i < middlewares.length; i += 1) {
        expect(middlewares[i].spy).to.have.been.calledAfter(middlewares[i - 1].spy);
      }
    });

    it('should deny calling tcp:false actions', () => {
      const ms = new MicroService({
        actions: {
          sample: {
            tcp: false,
            handler() {},
          },
        },
      });

      return expect(ms.call('sample', {}, { caller: 'tcp' }))
        .to.eventually.be.rejectedWith('Not allowed!');
    });

    it('should throw not-found errors if method is not defined', () => {
      const ms = new MicroService({});
      return expect(ms.call('sample'))
        .to.eventually.be.rejectedWith('NotFound');
    });
  });
});
