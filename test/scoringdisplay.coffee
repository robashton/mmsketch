should = require('should')
_ = require('underscore')
find_artist = require('./util').find_artist
ManualContext = require('./context')

Scenario "Basic victory scoring", ->
  context = new ManualContext()
  bob = null
  alice = null
  artist = null
  guesser = null

  Given "a server happily running and minding its own business", (done) ->
    context.next_word 'flibble'
    context.start done

  When "bob joins the game", (done) ->
    context.set_global_score_of 'bob', 0
    bob = context.add_client_called 'bob', done

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

  after (done) ->
    context.dispose done

Scenario "a game that isn't won by anybody", ->
  context = new ManualContext()
  bob = null
  alice = null
  artist = null
  guesser = null
  
  Given "Bob is playing a game with alice", (done) ->
    context.start ->
      context.set_global_score_of 'bob', 0
      context.set_global_score_of 'alice', 0
      alice = context.add_client_called 'alice'
      bob = context.add_client_called 'bob'
      context.wait_for_all_clients ->
        artist = find_artist [alice, bob]
        guesser = if artist is bob then alice else bob
        done()
   
  When "the game ends with nobody winning", (done) ->
    context.force_round_over done

  Then "the guesser receives no points", ->
    guesser.global_score().should.equal('0')

  And "the artist receives no points", ->
    artist.global_score().should.equal('0')

  after (done) ->
    context.dispose done


Scenario "consecutive games with a winner", ->
  context = new ManualContext()
  bob = null
  alice = null
  james = null
  artist = null
  guessers=  null
  
  Given "alice, bob and james are playing a game", (done) ->
    context.next_word 'flibble'
    context.next_word 'flobble'
    context.start ->
      alice = context.add_client_called 'alice'
      bob = context.add_client_called 'bob'
      james = context.add_client_called 'james'
      context.wait_for_all_clients ->
        artist = find_artist [alice, bob, james]
        guessers = (player for player in [alice, bob, james] when !player.isDrawing())
        done()

  When "guesser #1 guesses the word correctly", (done) ->
    guessers[0].guess 'flibble', done

  And "The round ends", (done) ->
    context.force_round_over done

  Then "the artist should get some points", ->
    artist.global_score().should.not.equal('0')

  And "guesser #1 should get some points", ->
    guessers[0].global_score_changed().should.equal(true)

  And "guesser #2 should get no points", ->
    guessers[1].global_score_changed().should.equal(false)

  When "a new round begins", ->
    bob.reset_listeners()
    alice.reset_listeners()
    james.reset_listeners()

  And "ends with no winners", (done) ->
    context.force_round_over done

  Then "the previous artist should get no points", ->
    artist.global_score_changed().should.equal(false)

  And "the previous winner should get no points", ->
    guessers[0].global_score_changed().should.equal(false)

  And "the previous loser should get no points", ->
    guessers[1].global_score_changed().should.equal(false)

  after (done) ->
    context.dispose done

Scenario "Local displays of score in the player list", ->
  context = new ManualContext()
  bob = null
  alice = null
  james = null
  artist = null
  guessers = null
 
  Given "bob, james, and alice are playing a game together", (done) ->
    context.next_word 'flibble'
    context.start ->
      bob = context.add_client_called 'bob'
      alice = context.add_client_called 'alice'
      james = context.add_client_called 'james'
      context.wait_for_all_clients ->
        artist = find_artist [bob, alice, james]
        guessers = (player for player in [alice, bob, james] when !player.isDrawing())
        done()

  When "guesser #1 guesses the word correctly", (done) ->
    guessers[0].guess 'flibble', done

  And "the game ends", (done) ->
    context.force_round_over done

  Then "guesser #1 should be on top of the score list", ->
    bob.player_in_list_at(0).should.equal(guessers[0].name)

  And "the artist should be second in the score list", ->
    bob.player_in_list_at(1).should.equal(artist.name)

  And "guesser #2 should be on the bottom of the score list", ->
    bob.player_in_list_at(2).should.equal(guessers[1].name)

  And "the score of guesser #1 has been updated in the score list", ->
    bob.score_in_list_at(0).should.not.equal('0')

  And "the score of the artist has been updated in the score list", ->
    bob.score_in_list_at(1).should.not.equal('0')

  And "the score of guesser #2 has stayed at zero :'(", ->
    bob.score_in_list_at(2).should.equal('0')

Scenario "persistence of scores across sessions", ->
  context = new ManualContext()
  bob = null
  alice = null
  artist = null
  guesser = null

  Given "alice and bob are playing a game together", (done) ->
    context.next_word 'flibble'
    context.start ->
      bob = context.add_client_called 'bob'
      alice = context.add_client_called 'alice'
      context.wait_for_all_clients ->
        artist = find_artist [bob, alice]
        guesser = if bob is artist then alice else bob
        done()

  When "the guesser guesses sucessfully", (done) ->
    guesser.guess 'flibble', done

  And "the round ends", (done) ->
    context.force_round_over done

  And "alice leaves the game", (done) ->
    alice.close done

  And "alice re-joins the game", (done) ->
    alice = context.add_client_called 'alice', done

  Then "alice should have her points from the previous game", ->
    alice.global_score().should.not.equal('0')
