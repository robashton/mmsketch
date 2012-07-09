var cookie = require('connect').utils

var TestAuthenticationStore = function() {
  
}

TestAuthenticationStore.prototype = {
  get: function(headers, cb) {
    if(headers.cookie) {
      var cookieData = cookie.parseCookie(headers.cookie)
      var username = cookieData['test.cookie']
      if(!username) return cb(null, null)
      cb(null, {
        passport: {
          user: { id:  username, username: username, displayName: username + 'display' }
        }
      })
    } else {
      cb("No cookie", null)
    }
  }
}

module.exports = TestAuthenticationStore