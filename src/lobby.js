
var socketio = require('socket.io')
,   util = require('util')

var Lobby = function(server) {
  this.server = server
  this.startListening()
}

Lobby.prototype = {
  startListening: function() {
    
    var io = socketio.listen(this.server)

    io.set('log level', 0)
    
    io.on('connection', function(socket) {
      sendStatusUpdate()

      socket.on('command', function(data) {
        data.sender = socket.id
        io.sockets.emit('command', data)
      })

      socket.on('disconnect', function(){ 
        console.log('Disconnect')
        sendStatusUpdate()
      })
    })
    function sendStatusUpdate() {
      io.sockets.emit('status', {
       clientCount: io.server.connections
      })
    }
  }
}

module.exports = Lobby
