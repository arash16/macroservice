const { extend } = require('./utils/deep');

class ConfigStore {
  constructor(initial = {}) {
    this._store = initial;
  }

  static mixin(obj) {
    const config = new ConfigStore();
    obj.get = config.get.bind(config);
    obj.set = config.set.bind(config);
    obj.loadConfig = config.load.bind(config);
  }

  get(key) {
    let result = this._store;
    if (!key) return result;

    const keys = key.split('.');
    for (const k of keys) result = result[k];
    return result;
  }

  set(key, value) {
    if (typeof key === 'object') {
      value = key;
      key = undefined;
    }

    if (!key) {
      if (typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('Cannot set value to whole state.');
      }
      this._store = extend(this._store, value);
      return;
    }

    let result = this._store;
    const keys = key.split('.');
    for (let i = 0; i < keys.length - 1; i += 1) {
      const k = keys[i];
      if (!result[k] || typeof result[k] !== 'object') {
        result[k] = {};
      }
      result = result[k];
    }

    const lKey = keys[keys.length - 1];
    result[lKey] = extend(result[lKey], value);
  }

  load(obj, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        this.load(value, `${prefix}${key}.`);
        continue;
      }

      const deepKey = prefix + key;
      const envKey = deepKey
        .toUpperCase().trim()
        .replace(/\W+/g, '_');

      let envValue = process.env[envKey];
      if (envValue == null) {
        this.set(deepKey, value);
        continue;
      }

      if (typeof value === 'number') {
        envValue = +envValue;
        this.set(deepKey, Number.isNaN(envValue) ? value : envValue);
        continue;
      }

      if (typeof value === 'boolean') {
        if (envValue && !/^(0|1|false|true)$/i.test(envValue)) {
          this.set(deepKey, value);
          continue;
        }

        envValue = envValue !== '0' && envValue !== 'false' && !!envValue;
      }

      this.set(deepKey, envValue);
    }
  }
}

module.exports = ConfigStore;
