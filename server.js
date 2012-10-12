var requirejs = require('requirejs')
  , path = require('path')
  , winston = require('winston')

requirejs.config({
  nodeRequire: require,
  baseUrl: __dirname,
});

if(!!process.env.BUILD)
  require('child_process').fork('node_modules/requirejs/bin/r.js', [ '-o', 'app.build.js']);

requirejs(['./src/web'],
  function(start) {
  start(__dirname)
})
 
