declare var require: any;

export const environment = {
  production: true,
  version: require('../../package.json').version,
  hasAuthentication: true
};
