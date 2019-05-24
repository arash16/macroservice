const ADDR = 'http://127.0.0.1:8081';
const { withApp } = require('../utils/test-utils');

describe('httpBodyParser', () => {
  it('should parse json body and provide it as input params.body', () => {
    const result = withApp(
      {
        services: [{
          publish: ADDR,
          actions: {
            test: {
              http: 'POST /test/:id',
              params: {
                body: Object,
              },
              handler({ id, body }) { return { id, body }; },
            },
          },
        }],
      },
      () => request(ADDR).post('/test/5').send({ x: 1 }),
    );

    return expect(result).to.have.jsonResponse({ id: '5', body: { x: 1 } });
  });

  it('should parse query params and provide it as input params.query', () => {
    const result = withApp(
      {
        services: [{
          publish: ADDR,
          actions: {
            test: {
              http: 'GET /test/:id',
              params: {
                query: Object,
              },
              handler({ id, query }) { return { id, query }; },
            },
          },
        }],
      },
      () => request(ADDR).get('/test/5?x=1'),
    );

    return expect(result).to.have.jsonResponse({ id: '5', query: { x: '1' } });
  });

  it('should respond errors inside middleware properly', async () => {
    const result = await withApp(
      {
        services: [{
          publish: ADDR,
          actions: {
            test: {
              http: 'POST /test/:id',
              params: {
                query: Object,
              },
              handler({ id, query }) { return { id, query }; },
            },
          },
        }],
      },
      () => request(ADDR)
        .post('/test/5?x=1')
        .set('Content-Type', 'application/x-www-form-urlencoded; charset=ascii'),
    );

    expect(result).to.have.status(415);
    expect(result.body.error.code).to.be.eql(415);
    expect(result.body.error.message).to.be.eql('unsupported charset "ASCII"');
  });
});
