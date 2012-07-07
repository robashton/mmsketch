var passport = require('passport')
    config = require('../src/config')
,   FacebookStrategy = require('passport-facebook').Strategy

var users = {}

passport.serializeUser(function(user, done) {
 done(null, user);
})

passport.deserializeUser(function(obj, done) {
  done(null, obj);
})

function configurePassport() {
  passport.use(new FacebookStrategy({
    clientID: config.fbclientid 
,   clientSecret: config.fbclientsecret 
,   callbackURL: config.fbcallback 
  },
  function(token, tokenSecret, profile, done) {
    users[profile.id] = profile
    done(null, profile)
  }))
}

module.exports = function(app) {
  configurePassport()
  app.get('/auth/facebook', passport.authenticate('facebook'))
  app.get('/auth/facebook/callback', 
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
      res.redirect('/')
  })
}
