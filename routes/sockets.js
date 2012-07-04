var socketio = require('socket.io')
,   util = require('util')


module.exports = function(app) {  
  var io = socketio.listen(app)

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

