define(function(require) {
  var passport = require('passport'),
      config = require('../config'),
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
      // TODO: Persist
      done(null, user)
    }))
  }

  return function(app) {
    configurePassport()
    app.get('/auth/facebook', passport.authenticate('facebook'))
    app.get('/auth/facebook/callback', 
      passport.authenticate('facebook', { failureRedirect: '/login' }),
      function(req, res) {
        res.redirect('/')
    })
  }
})
