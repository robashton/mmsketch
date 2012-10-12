define(['fs', 'path', 'module', 'require'],
  function(fs, path, module, require) {
  var routeDir = path.dirname(module.uri)
  return function(app) {
    fs.readdirSync(routeDir).forEach(function(file) {
    if (file === "index.js") return;
    var name = file.substr(0, file.indexOf('.js'))
    if(name.indexOf('.') >= 0) return
    console.log(name)
    require(['./' + name], function(route) {
      route(app)
    });
   });
  };
});
