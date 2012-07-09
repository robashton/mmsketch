should = require('should')
_ = require('underscore')
find_artist = require('./util').find_artist
ManualContext = require('./context')

Scenario "Various displays of personal status", ->
  context = new ManualContext()
  bob = null
  alice = null
  artist = null
  guesser = null

  Given "Bob is playing a game with alice", (done) ->
    context.next_word 'flibble'
    context.start ->
      context.set_global_score_of 'bob', 0
      bob = context.add_client_called 'bob', ->
        done()

  Then "bob is told he is playing", ->
    bob.displayed_name().should.equal('bobdisplay')

  And "bob is told what his global score is", ->
    bob.global_score().should.equal('0')

  And "bob should see his avatar", ->
    bob.displayed_avatar().should.include('bob')
 
  When "alice joins the game", (done) ->
    context.set_global_score_of 'alice', 0
    alice = context.add_client_called 'alice', ->
      artist = find_artist [alice, bob]
      guesser = if artist is bob then alice else bob
      done()

  And "the guesser guesses the word correctly", (done) ->
    guesser.guess 'flibble', ->
      context.force_round_over done

  Then "guesser has her score updated", ->
    guesser.global_score().should.not.equal('0')

  And "artist has his score updated", ->
    artist.global_score().should.not.equal('0')
