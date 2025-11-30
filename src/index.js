// Lynx Native CLI - Main entry point
module.exports = {
  init: require('./commands/init'),
  add: require('./commands/add'),
  sync: require('./commands/sync'),
  build: require('./commands/build')
};
