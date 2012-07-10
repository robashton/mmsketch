var fs = require('fs');

module.exports = function(app, game){
  fs.readdirSync(__dirname).forEach(function(file) {
  if (file === "index.js") return
  var name = file.substr(0, file.indexOf('.js'))
  if(name.indexOf('.') === 0) return
  require('./' + name)(app, game)
  })
}
