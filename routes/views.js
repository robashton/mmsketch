var path = require('path')

module.exports = function(app, game) {
  app.get('/viewround/:id', function(req, res) {
    res.sendfile(path.join(app.WEBROOT, 'replay.html'))
  })
}
