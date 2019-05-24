const reAddress = /^(\w+):\/\/([^:]*)(?::(\d+))?$/;

function parseAddress(address) {
  const r = reAddress.exec(address);
  if (!r) throw new Error('Invalid address format provided');
  const [, scheme, host, port] = r;

  switch (scheme) {
  case 'http':
  case 'tcp':
    return {
      host,
      port: +port,
    };

  case 'ipc':
    return { path: host };

  default:
    throw new Error(`Unknown scheme: ${scheme}`);
  }
}

module.exports = parseAddress;
