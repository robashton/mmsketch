var fork = require('child_process').fork,
    Browser = require('zombie'),
    http = require('http')

var server = null,
    port = process.env.port

function startServer(cb) {
  server = fork(process.cwd() + '/server.js', [], {
    silent: false,
    env: {
      port: port,
      test: true,
      redis: true,
      words: ''
    }
  })
  server.on('message', function(msg) {
    if(msg.command === 'ready')
      waitForServerReadiness(cb)
  })
}

function waitForServerReadiness(cb) {
  setTimeout(function() {
    http.get({
      host: 'localhost',
      port: port,
      path: '/socket.io/socket.io.js',
      method: 'GET',
    },function(res) { 
      if(res.statusCode === 404)
        waitForServerReadiness(cb)
      else
        cb()
    })
  }, 20)
}

startServer(function() {
  console.log('Ready')
})
