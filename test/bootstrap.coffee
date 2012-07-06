should = require('should')
_ = require('underscore')
ManualContext = require('./context')

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

  And "the artist should have the word displayed", ->
    artist = find_artist [bob, alice]
    artist.clientStatus().should.include 'fibble'
  
  When "bob disconnects", (done) ->
    bob.close done
  Then "alice should be told she is the only one", ->
    alice.clientCount().should.include('only player')
  And "alice should be waiting for other players again", ->
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

Scenario "Players guessing the word", ->
  context = new ManualContext()
  bob = null
  alice = null
  artist = null
  guesser = null

  Given "Two people are playing a game together", (done) ->
    context.next_word 'flibble'
    context.start ->
      bob = context.add_client_called 'bob', ->
        alice = context.add_client_called 'alice', done

  When "The wrong word is guessed", (done) ->
    artist = find_artist [alice, bob]
    guesser = if bob is artist then alice else bob
    guesser.guess 'orange', done

  Then "The guesser is told that he guessed wrong", ->
    guesser.lastGuess().should.include 'orange is not the word'

  And "the artist is still the artist", ->
    (artist is find_artist [alice, bob]).should.equal(true)
    
  When "The correct word is guessed", (done) ->
    guesser.guess 'flibble', done

  Then "The guesser is told that he guessed correctly", ->
    guesser.lastGuess().should.include 'flibble was correct!'

  And "the artist is told that he drew something useful", ->
    artist.lastGuess().should.include 'guessed correctly'

  And "the artist becomes the guesser", ->
    (artist is find_artist [alice, bob]).should.equal(false)

  And "the guesser becomes the artist", ->
    (guesser is find_artist [alice, bob]).should.equal(true)


