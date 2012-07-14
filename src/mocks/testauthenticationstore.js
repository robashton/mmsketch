var cookie = require('connect').utils

var TestAuthenticationStore = function(store, persistence) {
  this.persistence = persistence 
}

TestAuthenticationStore.prototype = {
  get: function(headers, cb) {
    if(headers.cookie) {
      var cookieData = cookie.parseCookie(headers.cookie)
      var username = cookieData['test.cookie']
      if(!username) return cb(null, null)

      var user = {
        id: username,
        displayName: username + 'display',
        username: username
      }
      this.persistence.savePlayer(username, user, function() {
        cb(null, { passport: { user: user }})
      })
    } else {
      cb("No cookie", null)
    }
  }
}

module.exports = TestAuthenticationStore
