debug = false
redis = false
Browser = require 'zombie'
fork = require('child_process').fork
cookie = require('connect').utils
http = require('http')

class ManualContext
  constructor: ->
    @server = null
    @port = parseInt(Math.random() * 63000) + 1000
    @clients = {}
    @pendingClients = 0
    @words = []
    @closed_listener = null
    @last_round_id = -1

  next_word: (word) =>
    @words.push word

  start: (done) =>
    @server= fork(process.cwd() + '/server.js',[], {
      silent: !debug,
      env: {
        port: @port
        test: true
        redis: redis
        words: @words.join()
      }
    })
    @server.on 'message', (msg) =>
      if(msg.command == 'ready')
        @wait_for_sockets_to_be_ready(done)
      if(msg.command == 'lastround')
        @last_round_id = msg.id

  wait_for_closed: (done) =>
    @closed_listener = done

  wait_for_sockets_to_be_ready: (done) =>
    try_get_socket_io = =>
      http.get({
        host: 'localhost'
        port: @port
        path: '/socket.io/socket.io.js'
        method: 'GET'
      }, (res) ->
        if(res.statusCode == 404)
          setTimeout try_get_socket_io, 20
        else
          done()
      )
    try_get_socket_io()

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

  for: (name) =>
    @clients[name]

  dispose: (done) =>
    @server.kill('SIGKILL')
    if(@closed_listener)
      @closed_listener()
    done()

  wait_for_sockets: (done) =>
    setTimeout done, 100

  force_round_over: (done) =>
    @server.send({ command: 'next-game'})
    setTimeout done, 100

  set_global_score_of: (username, score) =>
    @server.send({
      command: 'SetGlobalScore'
      userid: username
      score: score
    })

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
    @lastscore = "1337"

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
      @reset_listeners()
      setTimeout =>
        try
          @pad = @browser.evaluate('artPad')
        catch ex
          console.log(ex)
        finally
          cb()
      ,20

  reset_listeners: =>
    @last_score = @global_score()

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

  global_score_changed: =>
    @last_score isnt @global_score()

  displayed_avatar: =>
    (@jQuery '#player-avatar').attr('src')

  displayed_name: =>
    @value_of '#player-name'

  should_have_element: (selector) =>
    @browser.queryAll(selector).length.should.equal(1)

  player_list_has_player: (name) =>
    players = @jQuery('#room-feedback > span')
    found = false
    for x in [0..players.length]
      player = players.eq x
      if player.data('userid') is name
        found = true
        break
    return found

  player_in_list_at: (index) =>
    players = @jQuery('#room-feedback > span')
    players.eq(index).data('userid')

  score_in_list_at: (index) =>
    players = @jQuery('#room-feedback > span')
    player = players.eq(index)
    player.find('.score').text()

  player_list_count: =>
    @browser.queryAll('#room-feedback > span').length

  value_of: (selector) =>
    @browser.text(selector)

  jQuery: (selector) =>
    @browser.evaluate("$('" + selector + "')")

  getJson: (path, cb) =>
    http.get({
      host: 'localhost'
      port: @port
      path: path
      method: 'GET'
    }, (res) ->
      data = ''
      res.setEncoding('utf8')
      res.on 'data', (chunk) -> (data += chunk)
      res.on 'end', ->
        cb(JSON.parse(data))
    )

  click: (selector, done) =>
    element = @browser.querySelector(selector)
    @browser.fire 'click', element, done


  can_see: (selector) =>
    element = @jQuery selector  #Evil - YAY
    element.is(':visible')

  can_see_paintbrushes: =>
    @can_see '#client-paintbrush-container'

  can_see_text_input: =>
    @can_see '#client-input-container'

  can_see_time_left: =>
    @can_see '#timer-text'

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
    setTimeout done, 100

module.exports = ManualContext
