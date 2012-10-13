define(function(require) {
   var MemoryStore = require('connect').middleware.session.MemoryStore
    ,  cookie = require('connect').utils

   var store = null
     , check = null
     ,  cookieName = null
     ,  findCurrentUser = null

  if(process.env.TEST) {
    store = new MemoryStore()
    cookieName = 'test.cookie'
    findCurrentUser = function(req, res, cb) {
      var cookieData = cookie.parseCookie(req.headers.cookie)
      var username = cookieData['test.cookie']
      if(!username) return cb(null, null)
      var user = {
        id: username,
        displayName: username + 'display',
        username: username
      }
      cb(null, user)
    }
  } else {
    store = new MemoryStore()
    cookieName = 'express.sid'
    findCurrentUser = function(req, res, cb) {
      if(req.headers.cookie) {
        var cookieData = cookie.parseCookie(req.headers.cookie)
        var sessionID = cookieData[cookieName]
        store.get(sessionID, cb)
      }
      else {
        cb(null,null)
      }
    }
  }

  return {
    store: store,
    check: function(req, res, next) {
      if(process.env.OFFLINE)
        return next()
      findCurrentUser(req, res, function(err, user) {
         if(user)  {
           next()
         } else {
           res.writeHead(302, {
            'Location': '/login'
           })
           res.end()
         }
      })
    },
    findCurrentUser: findCurrentUser
  }
})
