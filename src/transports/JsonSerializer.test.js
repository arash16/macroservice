const Serializer = require('./JsonSerializer');

describe('Serializer', () => {
  const serializer = new Serializer();

  it('should deserialize what it has serialized', () => {
    const obj = {
      x: 1,
      y: [1, {}, null],
      z: 'string',
    };

    const buf = serializer.encode(obj);
    const des = serializer.decode(buf);
    expect(des).to.deep.eql(obj);
  });

  it('#decode should throw bad request with invalid input', () => {
    expect(() => serializer.decode(Buffer.from(''))).to.throw();
  });

  it('#encode should throw bad request with circular input', () => {
    const obj = {}; obj.obj = obj;
    expect(() => serializer.encode(obj)).to.throw();
  });
});
