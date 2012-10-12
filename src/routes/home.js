define(function(require) {
  return function (app) {
    app.get('/', function (req, res) {
      res.render('index')
    });
  };
});
