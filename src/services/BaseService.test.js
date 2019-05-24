const BaseService = require('./BaseService');

describe('BaseService', () => {
  describe('parseArgs', () => {
    const app = {};
    const bService = new BaseService(app);

    it('should return params containing action and context containing service and app', () => {
      const { params, context } = bService.parseArgs('sample');
      expect(params.action).to.eql('sample');
      expect(context.app).to.eql(app);
      expect(context.service).to.eql(bService);
    });

    it('should given non-object params, set params.id', () => {
      const { params } = bService.parseArgs('sample', 12);
      expect(params.id).to.eql(12);
    });
  });
});
