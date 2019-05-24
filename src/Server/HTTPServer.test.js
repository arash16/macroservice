const ADDR = 'http://127.0.0.1:8081';
const ServiceError = require('../ServiceError');
const { withApp } = require('../utils/test-utils');

describe('HTTPServer', () => {
  it('should register and respond GET method', () => {
    const result = withApp(
      {
        services: [{
          publish: ADDR,
          actions: {
            test: {
              http: 'GET /test/:id',
              handler({ id }) { return { test: +id }; },
            },
          },
        }],
      },
      () => request(ADDR).get('/test/5'),
    );

    return expect(result).to.have.jsonResponse({ test: 5 });
  });

  it('should set status code from ServiceError thrown inside action correctly', async () => {
    let err;
    const result = await withApp(
      {
        services: [{
          publish: ADDR,
          actions: {
            test: {
              http: 'GET /test/:id',
              handler() {
                err = ServiceError.notFound('test not found');
                throw err;
              },
            },
          },
        }],
      },
      () => request(ADDR).get('/test/5'),
    );

    expect(result).to.have.status(404);
    expect(result.body.error).to.be.eql(err && err.toJSON());
  });
});
