var passport = require('passport')
,   TwitterStrategy = require('passport-twitter').Strategy

var users = {}

passport.serializeUser(function(user, done) {
 done(null, user);
})

passport.deserializeUser(function(obj, done) {
  done(null, obj);
})

function configurePassport() {
  passport.use(new TwitterStrategy({
    consumerKey: '0dDDs6zADI9Yh3ckzStViw'
,   consumerSecret: 'MS9CDpSVNjDF6fWRqr3tVXaxiGe29xzkw4084kYTU'
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
