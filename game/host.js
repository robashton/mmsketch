var Host = function(io) {
  this.io = io
  this.io.on('connected', this.onConnected.bind(this))
}

Host.prototype = {
  onConnected: function(socket) {
    this.clients.push(new Client(socket))
  }
}

var Client = function(socket) {
  this.socket = socket
}
