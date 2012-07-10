should = require('should')
_ = require('underscore')
find_artist = require('./util').find_artist
ManualContext = require('./context')

Scenario "the current player service", ->
  context = new ManualContext()
  bob = null
  alice = null
  retrievedData = null

  Given "a server with alice and bob", (done) ->
    context.start ->
      bob = context.add_client_called 'bob'
      alice = context.add_client_called 'alice'
      context.wait_for_all_clients done

  When "asking for a list of the players currently on", (done) ->
    bob.getJson '/players', (data) ->
      retrievedData = data
      done()

  Then "the data contains alice", ->
    alicedata = player for player in retrievedData when player.id = 'alice'
    should.exist(alicedata)

  And "the data contains bob", ->
    bobdata = player for player in retrievedData when player.id = 'bob'
    should.exist(bobdata)

