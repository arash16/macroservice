const parseAddress = require('./parseAddress');

describe('parseAddress', () => {
  it('should parse http address correctly', () => {
    expect(parseAddress('http://127.0.0.2:3000'))
      .to.deep.equal({ host: '127.0.0.2', port: 3000 });
  });

  it('should parse tcp address correctly', () => {
    expect(parseAddress('tcp://127.0.0.2:3000'))
      .to.deep.equal({ host: '127.0.0.2', port: 3000 });
  });

  it('should parse ipc address correctly', () => {
    expect(parseAddress('ipc:///var/ss.sock'))
      .to.deep.equal({ path: '/var/ss.sock' });
  });

  it('should throw exception for invalid address scheme', () => {
    expect(() => parseAddress('unknown:///var/ss.sock'))
      .to.throw();
  });
});
