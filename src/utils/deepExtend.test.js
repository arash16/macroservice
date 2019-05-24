const deepExtend = require('./deepExtend');

describe('deepExtend', () => {
  it('should return target if it\'s not object', () => {
    expect(deepExtend({}, 'val'))
      .to.eql('val');
  });

  it('should return target if source is not object', () => {
    expect(deepExtend('src', 'val'))
      .to.eql('val');
  });

  it('should assign array values as is', () => {
    expect(deepExtend({ x: [1, 2] }, { x: [3, 4] }))
      .to.deep.eql({ x: [3, 4] });
  });

  it('should extend deep properties', () => {
    const result = deepExtend(
      { x: { y: 1 } },
      { x: { z: 2 } },
    );
    expect(result).to.deep.eql({ x: { y: 1, z: 2 } });
  });

  it('should work on complex stuff', () => {
    const result = deepExtend(
      { x: { y: 1, z: [1, 2] }, a: 1 },
      { x: { z: 2 }, a: { b: 1 } },
    );
    expect(result).to.deep.eql({ x: { y: 1, z: 2 }, a: { b: 1 } });
  });
});
