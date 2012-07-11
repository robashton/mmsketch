should = require('should')
_ = require('underscore')
find_artist = require('./util').find_artist
ManualContext = require('./context')

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
  And 'alice should be told there are three players', ->
    alice.clientCount().should.include('3 players')
  And 'bob should be told there are three players', ->
    bob.clientCount().should.include('3 players')
  And 'james should be guessing the current word', ->
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
      bob = context.add_client_called 'bob'
      alice = context.add_client_called 'alice'
      james = context.add_client_called 'james'
      hilda = context.add_client_called 'hilda'
      context.wait_for_all_clients done
  When "the current artist leaves", (done) ->
    artist =  find_artist([bob, alice, james, hilda])
    artist.close done
  Then "another player should be chosen as the artist", ->
    artist = find_artist([bob, alice, james, hilda])
    should.exist(artist)
   

Scenario "Players guessing the word on an iPad", ->
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
      context.wait_for_all_clients done

  When "the guesser guesses the word on an iPad", (done) ->
    artist = find_artist [bob, alice]
    guesser = if bob is artist then alice else bob
    guesser.guess 'Flibble', done

  Then "the guesser is told he did good",  ->
    guesser.lastGuess().should.include('flibble correctly')


Scenario "Players guessing the word", ->
  context = new ManualContext()
  bob = null
  alice = null
  james = null
  artist = null
  guesser1 = null
  guesser2 = null

  Given "Three people are playing a game together", (done) ->
    context.next_word 'flibble'
    context.start ->
      bob = context.add_client_called 'bob'
      alice = context.add_client_called 'alice'
      james = context.add_client_called 'james'
      context.wait_for_all_clients done

  When "The wrong word is guessed", (done) ->
    artist = find_artist [alice, bob, james]
    guessers = (player for player in [alice, bob, james] when !player.isDrawing())
    guesser1 = guessers[0]
    guesser2 = guessers[1]
    guesser1.guess 'orange', done

  Then "The guesser is told that he guessed wrong", ->
    guesser1.lastGuess().should.include 'orange is not the word'

  And "the artist is still the artist", ->
    (artist is find_artist [alice, bob, james]).should.equal(true)
    
  When "The correct word is guessed by guesser #1", (done) ->
    guesser1.guess 'flibble', done

  Then "guesser #1 is told that he guessed correctly", ->
    guesser1.lastGuess().should.include 'flibble correctly'

  And "guesser #1 can no longer see the text input", ->
    guesser1.can_see_text_input().should.equal(false)

  And "the artist is told that the guesser guessed it correctly", ->
    artist.lastGuess().should.include guesser1.displayName() + ' guessed the word'

  And "guesser #2 is told that guesser #1 beat him to the punch", ->
    guesser2.lastGuess().should.include guesser1.displayName() + ' guessed the word'

  When "The correct word is guessed by guesser #2", (done) ->
    guesser2.guess 'flibble', done

  Then "guesser #2 is told that he guessed correctly", ->
    guesser2.lastGuess().should.include 'flibble correctly'
    
  And "the artist is told that the guesser guessed it correctly", ->
    artist.lastGuess().should.include guesser2.displayName() + ' guessed the word'
  
  And "guesser #2 can no longer see the text input", ->
    guesser2.can_see_text_input().should.equal(false)

  When "The game is over", (done) ->
    context.force_round_over(done)

  And "the artist becomes the guesser", ->
    (artist is find_artist [alice, bob, james]).should.equal(false)

  And "guesser #1 becomes the artist", ->
    (guesser1 is find_artist [alice, bob, james]).should.equal(true)


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

  And "the canvas is wiped clean for all players", ->
    bob.pad.was_wiped().should.equal(true)
    alice.pad.was_wiped().should.equal(true)
    james.pad.was_wiped().should.equal(true)

  And "a new word is chosen", ->
    newartist.clientStatus().should.include 'pie'
    
