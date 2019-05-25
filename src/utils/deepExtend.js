function isValue(obj) {
  return !obj || typeof obj !== 'object' || Array.isArray(obj);
}

function deepExtend(target, source) {
  if (isValue(source) || isValue(target)) {
    return source;
  }

  for (const [key, val] of Object.entries(source)) {
    target[key] = deepExtend(target[key], val);
  }

  return target;
}

module.exports = deepExtend;
