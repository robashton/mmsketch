var passport = require('passport')
,   TwitterStrategy = require('passport-twitter').Strategy

var users = {}

function configurePassport() {
  passport.use(new TwitterStrategy({
    consumerKey: '0dDDs6zADI9Yh3ckzStViw'
,   consumerSecret: 'MS9CDpSVNjDF6fWRqr3tVXaxiGe29xzkw4084kYTU'
,   callbackURL: "http://127.0.0.1:8080/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    users[profile.id] = profile
    done(null, profile)
  }))
}

module.exports = function(app) {
  configurePassport()
 
  app.get('/auth/twitter', passport.authenticate('twitter'))
  app.get('/auth/twitter/callback', 
    passport.authenticate('twitter', { failureRedirect: '/login' }),
    function(req, res) {
      res.redirect('/')
  })
}
