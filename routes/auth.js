var passport = require('passport')
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
    clientID: '317150545045671'
,   clientSecret: 'b5290692796e002d8a442bf346e810db'
,   callbackURL: "http://localhost:8080/auth/facebook/callback"
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
