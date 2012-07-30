var cookie = require('connect').utils

var OfflineAuthenticationStore = function(store, persistence) {
  this.persistence= persistence
  this.usernames = [
    "bob",
    "alice",
    "james",
    "whatsit",
    "billy",
    "hilly",
    "hilda",
    "jo",
    "robashton",
    "dero",
    "flo"
  ]
}

OfflineAuthenticationStore.prototype = {
  get: function(headers, cb) {
    var username = this.next()
    var user = {
      id: username,
      displayName: username + 'display',
      username: username
    }
    this.persistence.savePlayer(username, user, function() {
      cb(null, { passport: { user: user }})
    })
  },
  next: function() {
    return this.usernames.pop()
  }
}

module.exports = OfflineAuthenticationStore
