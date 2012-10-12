define(function(require) {
  var drawmo = require('../drawmo')

  return function (app) {
    app.get('/', function (req, res) {
      res.render('index', {
        currentWord: drawmo.currentWord()
      })
    });
  };
});
