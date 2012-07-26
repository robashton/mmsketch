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


Scenario "Everybody guesses the word", ->
  context = new ManualContext()
  bob = null
  alice = null
  james = null
  artist = null
  guesser = null

  Given "three people are playing a game together", (done) ->
    context.next_word 'flibble'
    context.next_word 'pie'
    context.start ->
      bob = context.add_client_called 'bob'
      alice = context.add_client_called 'alice'
      james = context.add_client_called 'james'
      context.wait_for_all_clients ->
        artist = find_artist [bob, alice, james]
        guesser = (player for player in [alice, bob, james] when !player.isDrawing())
        done()

  When "everybody guesses the word", (done) ->
    console.log('Artist is ' ,artist.name)
    guesser[0].guess 'flibble', ->
      guesser[1].guess 'flibble', done

  Then "the first guesser becomes the artist", ->
    (guesser[0] is find_artist [bob, alice, james]).
      should.equal(true)

  And "a new word is chosen", ->
    guesser[0].clientStatus().should.include('pie')
  
  after (done) ->
    context.dispose(done)
