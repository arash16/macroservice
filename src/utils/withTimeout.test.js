const withTimeout = require('./withTimeout');

describe('withTimeout', () => {
  function resolveAfter(timer, val) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(val), timer);
    });
  }

  function rejectAfter(timer, val) {
    return new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error(val)), timer);
    });
  }

  it('should reject if timeout expires', async () => {
    const p1 = withTimeout(() => resolveAfter(50), 20);
    const p2 = withTimeout(() => rejectAfter(50), 20);

    return Promise.all([
      expect(p1).to.eventually.be.rejectedWith('Timeout Error'),
      expect(p2).to.eventually.be.rejectedWith('Timeout Error'),
    ]);
  });

  it('should resolve if resolved before timeout', () => {
    const promise = withTimeout(() => resolveAfter(20, 'test'), 50);
    return expect(promise).to.eventually.be.eql('test');
  });

  it('should reject if rejected internally before timeout', () => {
    const promise = withTimeout(() => rejectAfter(20, 'test'), 50);
    return expect(promise).to.eventually.be.rejectedWith('test');
  });

  it('should cancel the given promise if timeout expires', async () => {
    const inPromise = resolveAfter(50, 'test');
    inPromise.cancel = sinon.stub();
    const promise = withTimeout(() => inPromise, 20);

    try {
      await promise;
    } catch (e) {
      expect(inPromise.cancel).to.have.been.called;
    }
  });

  it('should call fallback function on timeout and resolve with it\'s result', () => {
    const result = withTimeout(() => resolveAfter(600), 20, () => 123);
    return expect(result).to.eventually.be.eql(123);
  });
});
