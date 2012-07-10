should = require('should')
_ = require('underscore')
find_artist = require('./util').find_artist
ManualContext = require('./context')


Scenario "Player presence on the game list", ->
  context = new ManualContext()
  bob = null
  alice = null

  Given "A server with nobody on it", (done) ->
    context.start done

  When "bob joins the game", (done) ->
    bob = context.add_client_called 'bob', done

  Then "bob should see himself in the player list", ->
    bob.player_list_has_player('bob').should.equal(true)

  And "bob should be the only player in the list", ->
    bob.player_list_count().should.equal(1)

  When "alice joins the game", (done) ->
    alice = context.add_client_called 'alice', done

  Then "alice should see bob in her player list", ->
    alice.player_list_has_player('bob').should.equal(true)
    
  And "alice should see herself in her player list", ->
    alice.player_list_has_player('alice').should.equal(true)

  And "bob should see alice in his player list", ->
    bob.player_list_has_player('alice').should.equal(true)

  And "bob should see himself in his player list", ->
    bob.player_list_has_player('bob').should.equal(true)

  When "bob leaves the game", (done) ->
    bob.close done

  Then "alice should no longer see bob in her player list", ->
    alice.player_list_has_player('bob').should.equal(false)

  And "alice should see herself in her player list", ->
    alice.player_list_has_player('alice').should.equal(true)

  And "alice be the only player in her player list", ->
    alice.player_list_count().should.equal(1)

