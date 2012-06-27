var socketio = require('socket.io')

module.exports = function(app) {  
  io = socketio.listen(app)
  io.set('transports', [
    'xhr-polling'
  ])

  io.on('connection', function(socket) {
    socket.on('command', function(data) {
      data.sender = socket.id
      io.sockets.emit('command', data)

    })
  })
}

