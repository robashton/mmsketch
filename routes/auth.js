var passport = require('passport'),
    config = require('../src/config'),
    FacebookStrategy = require('passport-facebook').Strategy,
    persistence = null

passport.serializeUser(function(user, done) {
  done(null, user)
})

passport.deserializeUser(function(user, done) {
  done(null, user);
})

function configurePassport() {
  passport.use(new FacebookStrategy({
    clientID: config.fbclientid 
,   clientSecret: config.fbclientsecret 
,   callbackURL: config.fbcallback 
  },
  function(token, tokenSecret, profile, done) {
    var user = {
      id: 'facebook:' + profile.id, 
      displayName: profile.displayName,
      username: profile.username
    }
    persistence.savePlayer(user.id, user)
    done(null, user)
  }))
}

module.exports = function(app, server) {
  persistence = server.persistence
  configurePassport()
  app.get('/auth/facebook', passport.authenticate('facebook'))
  app.get('/auth/facebook/callback', 
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
      res.redirect('/')
  })
}
