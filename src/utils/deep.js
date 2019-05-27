function isValue(obj) {
  return !obj
    || typeof obj !== 'object'
    || Array.isArray(obj)
    || obj instanceof RegExp
    || obj instanceof Date;
}

function extend(target, source) {
  if (isValue(source) || isValue(target)) {
    return source;
  }

  for (const [key, val] of Object.entries(source)) {
    target[key] = extend(target[key], val);
  }

  return target;
}

function clone(obj) {
  if (Array.isArray(obj)) {
    return obj.map(clone);
  }

  if (isValue(obj)) return obj;

  const r = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      r[key] = clone(val);
    }
  }
  return r;
}

module.exports = { extend, clone };
