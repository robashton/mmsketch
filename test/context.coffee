debug = !!process.env.DEBUG
redis = !!process.env.REDIS
Browser = require 'zombie'
fork = require('child_process').fork
cookie = require('connect').utils
http = require('http')

alreadyRunning = false

class ManualContext
  constructor: ->
    @server = null
    @port = parseInt(Math.random() * 63000) + 1000
    @closed_listener = null

  start: (done) =>
    @server= fork(process.cwd() + '/server.js',[], {
      silent: !debug,
      env: {
        PORT: @port
        TEST: true
        REDIS: redis
      }
    })

  add_client_called: (name, cb) =>
    @pendingClients++
    @clients[name] = new ManualClient(this, name, @port)
    @clients[name].login name
    @clients[name].load_index =>
      @pendingClients--
      if(cb)
        cb()
        
    return @clients[name]

  add_anonymous_client: (cb) =>
    @pendingClients++
    client = new ManualClient(this, @port)
    client.load_index =>
      @pendingClients--
      if(cb)
        cb()
    return client

  wait_for_all_clients: (done) =>
    check = =>
      if (@pendingClients == 0)
        done()
      else
        setTimeout check, 50
    check()

  dispose: (done) =>
    @server.kill('SIGKILL')
    done()

class ManualClient
  constructor: (context, name, port) ->
    @browser = new Browser({debug: debug})
    @closed = false
    @page = null
    @name = name
    @port = port
    @base = 'http://localhost:' + port
    @pad = null
    @context = context

  loaded: => false
  was_redirected: => @browser.location.toString() != @page
  displayName: => (@name + 'display')
   
  wait: (test, cb) =>
    check = =>
      if test()
        cb()
      else
        setTimeout check, 50
    check()

  load_index: (cb) =>
    @page = @base + '/'
    @browser.visit @page
    @browser.on 'loaded', @hookCanvasElements
    @wait @loaded, =>
      setTimeout =>
        try
          @pad = @browser.evaluate('artPad')
        catch ex
        finally
          cb()
      ,20

  hookCanvasElements: =>
    @browser.evaluate('TEST = true')

module.exports = ManualContext
