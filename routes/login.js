module.exports = function(app) {
  app.get('/login', function(req, res) {
    res.redirect('/auth/facebook')
  })
}
