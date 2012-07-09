debug = false
Browser = require 'zombie'
fork = require('child_process').fork
cookie = require('connect').utils

class ManualContext
  constructor: ->
    @server = null
    @port = parseInt(Math.random() * 63000) + 1000
    @clients = {}
    @pendingClients = 0
    @words = []

  next_word: (word) =>
    @words.push word

  start: (done) =>
    @server= fork(process.cwd() + '/server.js',[], {
      silent: !debug,
      env: {
        port: @port
        test: true
        words: @words.join()
      }
    })
    setTimeout done, 500

  add_client_called: (name, cb) =>
    @pendingClients++
    @clients[name] = new ManualClient(this, name, 'http://localhost:' + @port)
    @clients[name].login name
    @clients[name].load_index =>
      @pendingClients--
      if(cb)
        cb()
        
    return @clients[name]

  add_anonymous_client: (cb) =>
    @pendingClients++
    client = new ManualClient(this, 'http://localhost:' + @port)
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

  for: (name) =>
    @clients[name]

  dispose: (done) =>
    @server.on('exit', done)
    @server.kill('SIGHUP')

  wait_for_sockets: (done) =>
    setTimeout done, 20

  force_round_over: (done) =>
    @server.send({ command: 'next-game'})
    setTimeout done, 20

  set_global_score_of: (username, score) =>
    @server.send({
      command: 'SetGlobalScore'
      userid: username
      score: score
    })

class ManualClient
  constructor: (context, name, base) ->
    @browser = new Browser({debug: debug})
    @closed = false
    @page = null
    @name = name
    @base = base
    @pad = null
    @context = context

  loaded: =>
    @browser.text('#client-status') != '' or @was_redirected()

  was_redirected: => @browser.location.toString() != @page

  displayName: => (@name + 'display')

  login: (name) =>
   @browser.cookies('localhost', '/', { httpOnly: true} ).set("test.cookie", name)
   
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
          console.log(ex)
        finally
          cb()
      ,20

  hookCanvasElements: =>
    @browser.evaluate('TEST = true')
    
  guess: (word, cb) =>
    @browser
      .fill('#client-input', word)
      .pressButton('#client-input-button')
    @context.wait_for_sockets cb

  lastGuess: => @browser.text('#client-feedback > span:last > p')

  global_score: =>
    @value_of '#player-score'

  displayed_avatar: =>
    (@jQuery '#player-avatar').attr('src')

  displayed_name: =>
    @value_of '#player-name'

  should_have_element: (selector) =>
    @browser.queryAll(selector).length.should.equal(1)

  value_of: (selector) =>
    @browser.text(selector)

  jQuery: (selector) =>
    @browser.evaluate("$('" + selector + "')")
    
  can_see: (selector) =>
    element = @jQuery selector  #Evil - YAY
    element.is(':visible')

  can_see_paintbrushes: =>
    @can_see '#client-paintbrush-container'

  can_see_text_input: =>
    @can_see '#client-input-container'

  clientCount: =>
    @value_of '#client-count'
   
  clientStatus: =>
    @value_of '#client-status'

  isDrawing: =>
    @clientStatus().indexOf('Drawing the word') >= 0

  isGuessing: =>
    @clientStatus().indexOf('is drawing') >= 0

  isWaiting: =>
    @clientStatus().indexOf('Waiting for other players') >= 0

  onBrowserError: (err) =>
    console.log(err)

  isActive: =>
    return !@closed

  close: (done) =>
    @closed = true
    @browser.evaluate('closeSockets()')
    setTimeout done, 20

module.exports = ManualContext
