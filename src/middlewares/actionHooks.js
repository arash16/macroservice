const deepExtend = require('../utils/deepExtend');

function validateHook(hook) {
  if (hook === undefined) return false;

  if (Array.isArray(hook)) {
    let result = false;
    for (const h of hook) {
      result = validateHook(h) || result;
    }
    return result;
  }

  if (typeof hook !== 'function') {
    throw new Error('Invalid hook provided.');
  }

  return true;
}

function validateHooks(hooks, action) {
  if (hooks === undefined) return false;
  if (typeof hooks !== 'object' || !hooks) {
    throw new Error('Invalid hooks provided.');
  }

  let result = false;
  for (const l of ['before', 'after', 'error', 'finally']) {
    result = (hooks[l] && validateHook(hooks[l][action])) || result;
  }
  return result;
}

async function callHook(hook, params, context) {
  if (!hook) return undefined;
  if (Array.isArray(hook)) {
    for (const h of hook) {
      if (await callHook(h, params, context) === 'SKIP') {
        break;
      }
    }
    return undefined;
  }

  const r = await hook.call(context, params, context);
  if (r && typeof r === 'object') {
    deepExtend(context, r);
  }
  return r;
}

function actionHooks(serviceDef, actionDef) {
  // TODO: merge service hooks + action hooks
  const { name: action, handler } = actionDef;
  const { hooks } = serviceDef;
  if (!validateHooks(hooks, action)) {
    return handler;
  }

  const beforeHook = hooks.before && hooks.before[action];
  const afterHook = hooks.after && hooks.after[action];
  const errorHook = hooks.error && hooks.error[action];
  const finallyHook = hooks.finally && hooks.finally[action];

  return async function wrappedHandler(params, context) {
    try {
      await callHook(beforeHook, params, context);

      if (context.result === undefined) {
        context.result = await handler.call(this, params, context);
      }

      await callHook(afterHook, params, context);

      return context.result;
    } catch (e) {
      context.error = e;
      await callHook(errorHook, params, context);
      if (context.result) return context.result;

      throw e;
    } finally {
      await callHook(finallyHook, params, context);
    }
  };
}

module.exports = {
  local: actionHooks,
  remote: actionHooks,
};
