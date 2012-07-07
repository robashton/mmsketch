module.exports = function(app) {
  app.get('/login', function(req, res) {
    if(process.env.test) {
      res.send('please login')
      res.end()
    } else
      res.redirect('/auth/facebook')
  })
}
