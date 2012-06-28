var socketio = require('socket.io')

module.exports = function(app) {  
  var io = socketio.listen(app)

  io.set('transports', [
    'xhr-polling'
  ])

  io.on('connection', function(socket) {

    console.log('Hi')
    io.sockets.emit('status', {
      clientCount: 1 //io.sockets.length
    })

    socket.on('command', function(data) {
      data.sender = socket.id
      io.sockets.emit('command', data)

    })
  })
}

