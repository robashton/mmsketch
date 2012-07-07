debug = false
Browser = require 'zombie'
fork = require('child_process').fork
cookie = require('connect').utils

class ManualContext
  constructor: ->
    @server = null
    @port = parseInt(Math.random() * 63000) + 1000 
    @clients = {}
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
    @clients[name] = new ManualClient('http://localhost:' + @port)
    @clients[name].login name
    @clients[name].load_index cb
    return @clients[name]

  add_anonymous_client: (cb) =>
    client = new ManualClient('http://localhost:' + @port)
    client.load_index cb
    return client

  for: (name) =>
    @clients[name]

  dispose: (done) =>
    @server.on('exit', done)
    @server.kill('SIGHUP')

class ManualClient
  constructor: (base) ->
    @browser = new Browser({debug: debug})
    @closed = false
    @page = null
    @base = base
    

  loaded: =>
    @browser.text('#client-status') != '' or @was_redirected()

  was_redirected: => @browser.location.toString() != @page

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
    @wait @loaded, cb

  hookCanvasElements: =>
    @browser.evaluate('TEST = true')
      
  guess: (word, cb) =>
    @browser
      .fill('#client-input', word)
      .pressButton('#client-input-button')
    @wait =>
      @value_of('#client-feedback > p:last').indexOf(word) >= 0
    ,cb

  lastGuess: => @browser.text('#client-feedback > p:last')

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
    @clientStatus().indexOf('Drawing') >= 0

  isGuessing: =>
    @clientStatus().indexOf('Guessing') >= 0

  isWaiting: =>
    @clientStatus().indexOf('Waiting') >= 0

  onBrowserError: (err) =>
    console.log(err)

  isActive: =>
    return !@closed

  close: (done) =>
    @closed = true
    @browser.evaluate('closeSockets()')
    setTimeout done, 20

module.exports = ManualContext