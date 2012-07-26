should = require('should')
_ = require('underscore')
find_artist = require('./util').find_artist
ManualContext = require('./context')

Scenario "Game ends with nobody guessing the word", ->
  context = new ManualContext()
  bob = null
  alice = null
  james = null
  artist = null
  newartist = null
  
  Given "three people are playing a game together", (done) ->
    context.next_word 'flibble'
    context.next_word 'pie'
    context.start ->
      bob = context.add_client_called 'bob'
      alice = context.add_client_called 'alice'
      james = context.add_client_called 'james'
      context.wait_for_all_clients ->
        artist = find_artist [bob, alice, james]
        done()

  When "the game ends without a succesful guess", (done) ->
    context.force_round_over(done)

  Then "another artist is chosen at random", ->
    newartist = find_artist [bob, alice, james]
    (artist is newartist).should.equal(false)

  And "the canvas is wiped for the artist", ->
    artist.pad.was_wiped().should.equal(true)

  And "the canvas is wiped clean for all players", ->
    bob.pad.was_wiped().should.equal(true)
    alice.pad.was_wiped().should.equal(true)
    james.pad.was_wiped().should.equal(true)

  And "a new word is chosen", ->
    newartist.clientStatus().should.include 'pie'

  after (done) ->
    context.dispose(done)

