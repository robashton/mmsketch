_ = require('underscore')
find_artist = require('./util').find_artist
ManualContext = require('./context')


Scenario "Players drawing stuff", ->
  context = new ManualContext()
  bob = null
  alice = null
  artist = null
  guesser = null

  Given "alice and bob are playing a game together", (done) ->
    context.start ->
      bob = context.add_client_called 'bob'
      alice = context.add_client_called 'alice'
      context.wait_for_all_clients ->
        artist = find_artist [bob, alice]
        guesser = if bob is artist then alice else bob
        done()

  When "the artist chooses a brush", (done) ->
    artist.pad.doChooseBrush 0
    context.wait_for_sockets done

  Then "the guesser sees that a brush was selected", ->
    (guesser.pad.sawBrushChosen 0).should.equal(true)

  When "the artist chooses a colour", (done) ->
    artist.pad.doChooseColour '#FFF'
    context.wait_for_sockets done

  Then "the guesser sees that a colour was selected", ->
    (guesser.pad.sawColourChosen '#FFF').should.equal(true)

  When "the artist starts drawing", (done) ->
    artist.pad.doDrawStart(5,5)
    context.wait_for_sockets(done)

  Then "the guesser sees that drawing starts", ->
    guesser.pad.sawDrawStart(5,5).should.equal(true)

  When "the artist moves while drawing", (done) ->
    artist.pad.doDrawMove(10, 10)
    context.wait_for_sockets(done)

  Then "the guessers sees that drawing happens", ->
    guesser.pad.sawDrawMove(10,10).should.equal(true)

  When "the artist finishes moving while drawing",(done) ->
    artist.pad.doDrawEnd()
    context.wait_for_sockets(done)

  Then "the guesser should see that drawing finishes", ->
    guesser.pad.sawDrawEnd().should.equal(true)

  When "the guessers tries to start drawing", (done) ->
    artist.pad.reset()
    guesser.pad.reset()
    guesser.pad.doDrawStart(5,5)
    context.wait_for_sockets(done)
      
  Then "the artist sees nothing", ->
    artist.pad.sawDrawStart(5,5).should.equal(false)

  When "the guesser tries to move while drawing", (done) ->
    guesser.pad.doDrawMove(10,10)
    context.wait_for_sockets(done)
  
  Then "the artist sees nothing", ->
    artist.pad.sawDrawMove(10,10).should.equal(false)

  When "the guesser tries to finish while drawing", (done) ->
    guesser.pad.doDrawEnd()
    context.wait_for_sockets(done)

  Then "the artist sees nothing", ->
    artist.pad.sawDrawEnd().should.equal(false)

  When "The guesser tries to choose a brush", (done) ->
    guesser.pad.doChooseBrush 0
    context.wait_for_sockets done

  Then "The artist sees nothing", ->
    (artist.pad.sawBrushChosen 0).should.equal(false)

  When "the guesser tries to choose a colour", (done) ->
    guesser.pad.doChooseColour '#FFF'
    context.wait_for_sockets done

  Then "The artist sees nothing", ->
    (artist.pad.sawColourChosen '#FFF').should.equal(false)
