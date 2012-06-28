Browser = require 'zombie'
GameServer = require '../src/gameserver'

class ManualContext
  constructor: ->
    @server = new GameServer
    @port = 8080
    @clients = {}

  start: (done) =>
    @server.on 'started', done
    @server.listen(@port)

  add_client_called: (name, cb) =>
    @clients[name] = new ManualClient('http://localhost:' + @port)
    @clients[name].load_index cb
    return @clients[name]

  for: (name) =>
    @clients[name]

class ManualClient
  constructor: (base) ->
    @browser = new Browser({debug: true})
    @base = base

  load_index: (cb) =>
    @browser.visit @base, cb

  should_have_element: (selector) =>
    @browser.queryAll(selector).length.should.equal(1)

  value_of: (selector) =>
    @browser.text(selector)

Scenario "Bootstrapping the game", ->
  context = new ManualContext()
  bob = null
  alice = null
  
  Given "a server in a ready state", (done) ->
    context.start(done)
  When "bob connects", (cb) ->
    bob = context.add_client_called 'bob', cb
  Then "bob should have a canvas displayed", ->
    bob.should_have_element('canvas')
  Then "bob should be told he is the only one", ->
    bob.value_of('#client-count').should.include('only player')

  When "alice connects", (cb) ->
    alice = context.add_client_called 'alice', cb
  Then "alice should have a canvas displayed", ->
    alice.should_have_element('canvas')
  Then "alice should be told there are two players", ->
    alice.value_of('#client-count').should.include('2 players')
  Then "bob should be told there are two players", ->
    bob.value_of('#client-count').should.include('2 players')


