Browser = require 'zombie'
should = require('should')
fork = require('child_process').fork
debug = false

class ManualContext
  constructor: ->
    @server = null
    @port = parseInt(Math.random() * 63000) + 1000 
    @clients = {}

  start: (done) =>
    @server= fork(process.cwd() + '/server.js',[], {
      silent: !debug,
      env: {
        port: @port
      }
    })
    setTimeout done, 300

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
    @browser = new Browser({debug: debug})
    @closed = false
    @base = base

  status_received: =>
    @browser.text('#client-count') != ''
   
  wait: (test, cb) =>
    check = =>
      if test()
        cb()
      else
        setTimeout check, 50
    check()

  load_index: (cb) =>
    @browser.visit @base, =>
      @wait this.status_received, cb

  should_have_element: (selector) =>
    @browser.queryAll(selector).length.should.equal(1)

  value_of: (selector) =>
    @browser.text(selector)

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

find_artist = (players) ->
  artist = null
  for player in players
    if(player.isActive() and player.isDrawing())
      artist = player
  return artist

Scenario "Basic Lobbying", ->
  context = new ManualContext()
  bob = null
  alice = null
  
  Given "a server in a clean state", (done) ->
    context.start done
  When "bob connects", (done) ->
    bob = context.add_client_called 'bob', done
  Then "bob should have a canvas displayed", ->
    bob.should_have_element('canvas')
  Then "bob should be told he is the only one", ->
    bob.clientCount().should.include('only player')
  Then  "bob should be waiting for other players", ->
    bob.isWaiting().should.equal(true)

  When "alice connects", (cb) ->
    alice = context.add_client_called 'alice', cb
  Then "alice should have a canvas displayed", ->
    alice.should_have_element('canvas')
  Then "alice should be told there are two players", ->
    alice.clientCount().should.include('2 players')
  Then "bob should be told there are two players", ->
    bob.clientCount().should.include('2 players')
  Then "either bob or alice should be told to draw", ->
    bobControl = bob.isDrawing() ? 1 : 0
    aliceControl = alice.isDrawing() ? 1 : 0
    total = bobControl + aliceControl
    total.should.equal(1)
  
  When "bob disconnects", (done) ->
    bob.close done
  Then "alice should be told she is the only one", ->
    alice.clientCount().should.include('only player')
  Then "alice should be waiting for other players again", ->
    alice.isWaiting().should.equal(true)
  after (done) ->
    context.dispose done


Scenario "New player joining whilst game is underway", ->
  context = new ManualContext()
  bob = null
  alice = null
  james = null

  Given "alice and bob are playing a game together", (done) ->
    context.start ->
      bob = context.add_client_called 'bob', ->
        alice = context.add_client_called 'alice', done
  When "james joins the game", (done) ->
    james = context.add_client_called 'james', done
  Then 'james should be told there are three players', ->
    james.clientCount().should.include('3 players')
  Then 'alice should be told there are three players', ->
    alice.clientCount().should.include('3 players')
  Then 'bob should be told there are three players', ->
    bob.clientCount().should.include('3 players')
  Then 'james should be guessing the current word', ->
    james.isGuessing().should.equal(true)
  after (done) ->
    context.dispose done

Scenario "Artist leaves the game and there are enough people to carry on", ->
  context = new ManualContext()
  bob = null
  alice = null
  james = null
  hilda = null

  Given "there are four people playing a game together", (done) ->
    context.start ->
      bob = context.add_client_called 'bob', ->
        alice = context.add_client_called 'alice', ->
          james = context.add_client_called 'james', ->
            hilda = context.add_client_called 'hilda', done
  When "the current artist leaves", (done) ->
    artist =  find_artist([bob, alice, james, hilda])
    artist.close done
  Then "another player should be chosen as the artist", ->
    artist = find_artist([bob, alice, james, hilda])
    should.exist(artist)



