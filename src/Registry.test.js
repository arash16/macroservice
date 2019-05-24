const Registry = require('./Registry');

describe('Registry', () => {
  describe('register', () => {
    const registry = new Registry();
    it('should assign name to the service', () => {
      registry.register('x', {});
      const service = registry.service('x');
      expect(service.name).to.equal('x');
    });
  });

  describe('services', () => {
    const registry = new Registry();
    it('should give all service names', () => {
      registry.register('x', {});
      registry.register('z', {});
      registry.register('y', {});
      expect(registry.services())
        .to.have.members(['x', 'y', 'z']);
    });
  });
});
