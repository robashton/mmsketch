var fork = require('child_process').fork,
    Browser = require('zombie'),
    http = require('http')

var server = null,
    port = 8001,
    num_clients = 1000,
    correct_word = 'blah',
    incorrect_word = 'nugget',
    clients = [],
    clientTimerInteval = null

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
  server.on('exit', function(x,y,z) {
    clearInterval(clientTimerInteval)
    console.log('Server down', x,y, z)
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
  for(var i = 0 ; i < num_clients; i++) {
    clients.push(new TestingClient('client-' + i)) 
  }
  clientTimerInteval = setInterval(tickClients, 100)
})

function tickClients() {
  for(var i = 0 ; i < num_clients; i++) {
    clients[i].tick()
  }
}


var TestingClient = function(name) {
  this.name = name
  this.status = 'disconnected'
  this.browser = null
  this.onNavigated = this.onNavigated.bind(this)
  this.waitForLoadedness = this.waitForLoadedness.bind(this)
  this.loadPageVariables = this.loadPageVariables.bind(this)
  this.injectTestContent = this.injectTestContent.bind(this)
  this.pad = null
}


TestingClient.prototype = {
  connect: function() {
    this.status = 'connecting'
    this.log('Connecting')
    this.browser = new Browser()
    this.browser.cookies('localhost', '/', { httpOnly: true})
          .set("test.cookie", this.name)
    this.browser.visit('http://localhost:' + port, this.onNavigated)
    this.browser.on('loaded', this.injectTestContent)
  },
  injectTestContent: function() {
    this.browser.evaluate('TEST = true')
  },
  onNavigated: function() {
    this.waitForLoadedness(this.loadPageVariables)
  },
  waitForLoadedness: function(cb) {
    if(this.browser.text('#client-status') !== '') {
      this.status = 'connected'
      cb()
    }
    else
      setTimeout(this.waitForLoadedness, 1000, cb)
  },
  loadPageVariables: function() {
    this.pad = this.browser.evaluate('artPad')
  },
  disconnect: function() {
    this.log('Disconnecting')
    this.browser.evaluate('closeSockets()')
    this.browser = null
    this.status = 'disconnected'
  },
  tick: function() {
    if(Math.random() * 1000 > 200) return
    if(this.status === 'disconnected')
      return this.considerConnecting()
    if(this.status === 'connected')
      this.determineMove()
  },
  considerConnecting: function() {
    var value = Math.random() * 1000
    if(value < 5) 
      return this.connect()
  },
  determineMove: function() {
    if(this.considerDisconnecting()) return
    var gameStatus = this.determineGameStatus() 
    if(gameStatus === 'drawing')
      return this.drawSomething()
    if(gameStatus === 'waiting')
      return;
    if(gameStatus === 'guessing')
      this.makeGuess()
  },
  drawSomething: function() {
    this.log('Drawing a line') 
    this.pad.doDrawStart(Math.random() * 800, Math.random() * 600)
    this.pad.doDrawMove(Math.random() * 800, Math.random() * 600)
    this.pad.doDrawEnd()
  },
  makeGuess: function() {
    var value = Math.random() * 1000
    if(value < 100) {
      this.log('Guessing correctly')
      this.browser.fill('#client-input', correct_word)
                  .pressButton('#client-input-button')
    } else {
      this.log('Guessing badly')
      this.browser.fill('#client-input', incorrect_word)
                  .pressButton('#client-input-button')
    }
  },
  considerDisconnecting: function() {
    var value = Math.random() * 2000
    if(value < 50) {
      this.disconnect()
      return true
    }
    return false
  },
  determineGameStatus: function() {
    var statusText = this.browser.querySelector('#client-status').textContent
    if(statusText.indexOf('Drawing the') >= 0)
      return 'drawing'
    if(statusText.indexOf('Waiting for') >= 0)
      return 'waiting'
    if(statusText.indexOf('is drawing') >= 0)
      return 'guessing'
  },
  log: function(msg) {
    console.log(this.name, msg)
  },
}
