var config;
var getConfig = function(key) {
  if(process.env[key] !== undefined) {
    return process.env[key];
  }

  if(config === undefined) {
    config = require('./config');
  }
  return config[key];
};

module.exports = {
  get: function(key) {
    return getConfig(key);
  }
};
