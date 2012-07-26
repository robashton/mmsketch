should = require('should')
_ = require('underscore')
find_artist = require('./util').find_artist
ManualContext = require('./context')

Scenario "Players guessing the word", ->
  context = new ManualContext()
  bob = null
  alice = null
  james = null
  hilda = null
  artist = null
  guesser1 = null
  guesser2 = null
  guesser3 = null

  Given "Four people are playing a game together", (done) ->
    context.next_word 'flibble'
    context.start ->
      bob = context.add_client_called 'bob'
      alice = context.add_client_called 'alice'
      james = context.add_client_called 'james'
      hilda = context.add_client_called 'hilda'
      context.wait_for_all_clients done
      console.log 'arse'

  When "The wrong word is guessed", (done) ->
    artist = find_artist [alice, bob, james, hilda]
    guessers = (player for player in [alice, bob, james, hilda] when !player.isDrawing())
    guesser1 = guessers[0]
    guesser2 = guessers[1]
    guesser1.guess 'orange', done

  Then "The guesser is told that he guessed wrong", ->
    guesser1.lastGuess().should.include 'orange is not the word'

  And "the artist is still the artist", ->
    (artist is find_artist [alice, bob, james, hilda]).should.equal(true)
    
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
  
  And "the artist becomes the guesser", ->
    (artist is find_artist [alice, bob, james, hilda]).should.equal(false)

  And "guesser #1 becomes the artist", ->
    newArtist = find_artist [alice, bob, james, hilda]
    (guesser1 is find_artist [alice, bob, james, hilda]).should.equal(true)
