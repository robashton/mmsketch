should = require('should')
_ = require('underscore')
find_artist = require('./util').find_artist
ManualContext = require('./context')


Scenario "Basic Lobbying", ->
  context = new ManualContext()
  bob = null
  alice = null
  artist = null
  guesser = null
  
  Given "a server in a clean state", (done) ->
    context.next_word 'fibble'
    context.start done
  When "bob connects", (done) ->
    bob = context.add_client_called 'bob', done
  Then "bob should have a canvas displayed", ->
    bob.should_have_element('canvas')
  And "bob should be told he is the only one", ->
    bob.clientCount().should.include('only player')
  And  "bob should be waiting for other players", ->
    bob.isWaiting().should.equal(true)
  And "bob shouldn't see the text input controls", ->
    bob.can_see_text_input().should.equal(false)
  And "bob shouldn't see the paintbrush controls", ->
    bob.can_see_paintbrushes().should.equal(false)

  When "alice connects", (cb) ->
    alice = context.add_client_called 'alice', cb
  Then "alice should have a canvas displayed", ->
    alice.should_have_element('canvas')
  And "alice should be told there are two players", ->
    alice.clientCount().should.include('2 players')
  And "bob should be told there are two players", ->
    bob.clientCount().should.include('2 players')
  And "either bob or alice should be told to draw", ->
    bobControl = bob.isDrawing() ? 1 : 0
    aliceControl = alice.isDrawing() ? 1 : 0
    total = bobControl + aliceControl
    total.should.equal(1)
    artist = find_artist [bob, alice]
    guesser = if artist is bob then alice else bob
  And "the artist should have the word displayed", ->
    artist.clientStatus().should.include 'fibble'
  And "the artist should have the paint brushes displayed", ->
    artist.can_see_paintbrushes().should.equal(true)
  And "the artist should not see the text input controls", ->
    artist.can_see_text_input().should.equal(false)
  And "the guesser should see the text input controls", ->
    guesser.can_see_text_input().should.equal(true)
  And "the guesser should not see the paint brushes displayed", ->
    guesser.can_see_paintbrushes().should.equal(false)

  When "bob disconnects", (done) ->
    bob.close done
  Then "alice should be told she is the only one", ->
    alice.clientCount().should.include('only player')
  And "alice should be waiting for other players again", ->
    alice.isWaiting().should.equal(true)
  And "alice shouldn't see the text input controls", ->
    alice.can_see_text_input().should.equal(false)
  And "alice shouldn't see the paintbrush controls", ->
    alice.can_see_paintbrushes().should.equal(false)
  after (done) ->
    context.dispose done
