const ConfigStore = require('./ConfigStore');

describe('ConfigStore', () => {
  describe('mixin', () => {
    it('should add store functions to given object', () => {
      const obj = {};
      ConfigStore.mixin(obj);
      expect(obj).to.own.property('get');
      expect(obj).to.own.property('set');
      expect(obj).to.own.property('loadConfig');
    });
  });

  describe('get', () => {
    it('should get first level key values', () => {
      const store = new ConfigStore({ key: 'val' });
      expect(store.get('key')).to.eql('val');
    });

    it('should get deep level keys', () => {
      const store = new ConfigStore({ x: { y: { z: 'val' } } });
      expect(store.get('x.y.z')).to.eql('val');
    });

    it('should get nested objects', () => {
      const store = new ConfigStore({ x: { y: { z: 'val' } } });
      expect(store.get('x.y')).to.be.deep.eql({ z: 'val' });
    });
  });

  describe('set', () => {
    it('should set first level keys', () => {
      const store = new ConfigStore();
      store.set('key', 'val');
      expect(store.get('key')).to.eql('val');
    });

    it('should set deep level keys', () => {
      const store = new ConfigStore();
      store.set('x.y.z', 'val');
      expect(store.get('x.y')).to.deep.eql({ z: 'val' });
    });

    it('should merge values when setting a object', () => {
      const store = new ConfigStore({ x: { y: 1 } });
      store.set({ x: { z: 2 } });
      expect(store.get()).to.deep.eql({ x: { y: 1, z: 2 } });
    });

    it('should throw when called with single non-object argument', () => {
      const store = new ConfigStore();
      expect(() => store.set([1, 2])).to.throw();
    });
  });

  describe('load', () => {
    beforeEach(() => {
      process.env = {};
    });

    it('should merge object to store', () => {
      const store = new ConfigStore({ x: { y: 1 } });
      store.load({ x: { z: 2 } });
      expect(store.get()).to.deep.eql({ x: { y: 1, z: 2 } });
    });

    it('should merge and use env variables when available', () => {
      const store = new ConfigStore({ x: { y: 1 } });
      process.env.X_Z = 3;
      process.env.X_B = 'false';
      store.load({ x: { z: 2, b: true } });
      expect(store.get()).to.deep.eql({ x: { y: 1, z: 3, b: false } });
    });

    it('should merge and not use env variables when it\'s not a number', () => {
      const store = new ConfigStore({ x: { y: 1 } });
      process.env.X_Z = 'abc';
      store.load({ x: { z: 2 } });
      expect(store.get()).to.deep.eql({ x: { y: 1, z: 2 } });
    });

    it('should merge and not use env variables when it\'s not a boolean', () => {
      const store = new ConfigStore({ x: { y: 1 } });
      process.env.X_A = 'cba';
      process.env.X_B = 'abc';
      store.load({ x: { a: true, b: false } });
      expect(store.get()).to.deep.eql({ x: { y: 1, a: true, b: false } });
    });
  });
});
