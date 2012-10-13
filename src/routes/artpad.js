define(function(require) {
  var sessions = require('../sessions')
  return function(app) {
    app.get('/artpad', [ sessions.check ], function(req, res) {
      res.send('hello world')
      res.end()
    })
  }
})
