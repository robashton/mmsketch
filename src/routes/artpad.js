define(function(require) {
  var sessions = require('../sessions')
    , drawmo = require('../drawmo')

  return function(app) {
    app.get('/artpad', [ sessions.check ], function(req, res) {
      res.render('artpad', {
        currentWord:  drawmo.currentWord()
      })
    })
  }
})
