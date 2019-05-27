const bodyParser = require('body-parser');

function httpBodyParser(serviceDef, actionDef) {
  const { http, handler, params: paramsDef } = actionDef;
  if (!http || !paramsDef) return handler;

  const mids = [];

  if (typeof paramsDef.body === 'object' || paramsDef.body === Object) {
    mids.push(bodyParser.json());
  }

  if (paramsDef.query) {
    mids.push(bodyParser.urlencoded({ extended: false }));
  }

  if (!mids.length) return handler;

  return async function wrappedHandler(params, context) {
    if (context.req && context.res) {
      for (const m of mids) {
        await new Promise((resolve, reject) => {
          m(context.req, context.res, err => {
            if (err) reject(err);
            else resolve();
          });
        });
      }

      params.body = context.req.body;
      params.query = context.req.query;
    }

    return handler.call(this, params, context);
  };
}

module.exports = {
  local: httpBodyParser,
  remote: httpBodyParser,
};
