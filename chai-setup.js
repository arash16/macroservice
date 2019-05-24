const chai = require('chai');
chai.use(require('chai-http'));
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

global.expect = require('chai').expect;
global.sinon = require('sinon');

global.chai = chai;
global.request = chai.request;

chai.use(() => {
  chai.Assertion.addMethod('jsonResponse', async function (expectedObj) {
    return expect(await (await this._obj).body).to.be.eql(expectedObj);
  });
});
