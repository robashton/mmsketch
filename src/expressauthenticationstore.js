var cookie = require('connect').utils

var ExpressAuthenticationStore = function(store, persistence) {
  this.store = store;
  this.persistence = persistence;
}

ExpressAuthenticationStore.prototype = {
  get: function(headers, cb) {
    if(headers.cookie) {
      var cookieData = cookie.parseCookie(headers.cookie)
      var sessionID = cookieData['express.sid']
      this.store.get(sessionID, cb)
    } else {
      cb("No cookie", null)
    }
  }
}

module.exports = ExpressAuthenticationStore
