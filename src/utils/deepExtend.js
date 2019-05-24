function deepExtend(target, source) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return source;
  }

  if (!target || typeof target !== 'object' || Array.isArray(target)) {
    return source;
  }

  for (const [key, val] of Object.entries(source)) {
    target[key] = deepExtend(target[key], val);
  }

  return target;
}

module.exports = deepExtend;
