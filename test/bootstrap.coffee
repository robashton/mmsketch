Browser = require 'zombie'
fork = require('child_process').fork

class ManualContext
  constructor: ->
    @server = null
    @port = parseInt(Math.random() * 63000) + 1000 
    @clients = {}

  start: (done) =>
    @server= fork(process.cwd() + '/server.js',[], {
      env: {
        port: @port
      }
    })
    setTimeout done, 400

  add_client_called: (name, cb) =>
    @clients[name] = new ManualClient('http://localhost:' + @port)
    @clients[name].load_index cb
    return @clients[name]

  for: (name) =>
    @clients[name]

  dispose: (done) =>
    @server.on('exit', done)
    @server.kill('SIGHUP')

class ManualClient
  constructor: (base) ->
    @browser = new Browser({debug: true})
    @base = base

  status_received: =>
    @browser.text('#client-count') != ''
   
  wait: (test, cb) =>
    check = =>
      if test()
        cb()
      else
        setTimeout check, 100
    check()

  load_index: (cb) =>
    @browser.visit @base, =>
      @wait this.status_received, cb

  should_have_element: (selector) =>
    @browser.queryAll(selector).length.should.equal(1)

  value_of: (selector) =>
    @browser.text(selector)

  onBrowserError: (err) =>
    console.log(err)

  close: (done) =>
    @browser.visit @base + '/wegweg', done

Scenario "Basic connectivity", ->
  context = new ManualContext()
  bob = null
  alice = null
  
  Given "a server in a ready state", (done) ->
    context.start done
  When "bob connects", (done) ->
    console.log ('CONNECTING BOB')
    bob = context.add_client_called 'bob', done
  Then "bob should have a canvas displayed", ->
    bob.should_have_element('canvas')
  Then "bob should be told he is the only one", ->
    bob.value_of('#client-count').should.include('only player')
  Then  "bob should not have control over the game", ->
    bob.value_of('#client-status').should.include('waiting')

  When "alice connects", (cb) ->
    alice = context.add_client_called 'alice', cb
  Then "alice should have a canvas displayed", ->
    alice.should_have_element('canvas')
  Then "alice should be told there are two players", ->
    alice.value_of('#client-count').should.include('2 players')
  Then "bob should be told there are two players", ->
    bob.value_of('#client-count').should.include('2 players')
  Then "either bob or alice should be given control over the game", ->
    bobStatus = bob.value_of('#client-status')
    aliceStatus = alice.value_of('#client-status')
    
  When "bob disconnects", (done) ->
    bob.close done
  Then "alice should be told she is the only one", ->
    alice.value_of('#client-count').should.include('only player')

  after (done) ->
    context.dispose done


