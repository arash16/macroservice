const { extend } = require('./deep');

describe('deep', () => {
  describe('extend', () => {
    it('should return target if it\'s not object', () => {
      expect(extend({}, 'val'))
        .to.eql('val');
    });

    it('should return target if source is not object', () => {
      expect(extend('src', 'val'))
        .to.eql('val');
    });

    it('should assign array values as is', () => {
      expect(extend({ x: [1, 2] }, { x: [3, 4] }))
        .to.deep.eql({ x: [3, 4] });
    });

    it('should extend deep properties', () => {
      const result = extend(
        { x: { y: 1 } },
        { x: { z: 2 } },
      );
      expect(result).to.deep.eql({ x: { y: 1, z: 2 } });
    });

    it('should work on complex stuff', () => {
      const result = extend(
        { x: { y: 1, z: [1, 2] }, a: 1 },
        { x: { z: 2 }, a: { b: 1 } },
      );
      expect(result).to.deep.eql({ x: { y: 1, z: 2 }, a: { b: 1 } });
    });
  });
});
