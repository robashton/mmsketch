_ = require('underscore')
find_artist = require('./util').find_artist
ManualContext = require('./context')

Scenario "Drawing with no brush selection made", ->
  context = new ManualContext()
  bob = null
  alice = null
  artist = null
  guesser = null

  Given "alice and bob and are playing a game together", (done) ->
    context.start ->
      bob = context.add_client_called 'bob'
      alice = context.add_client_called 'alice'
      context.wait_for_all_clients ->
        artist = find_artist [bob, alice]
        guesser = if bob is artist then alice else bob
        done()
        
  When "the artist draws without selecting a brush", (done) ->
    artist.pad.doDrawStart(5,5)
    artist.pad.doDrawMove(10, 10)
    artist.pad.doDrawEnd()
    context.wait_for_sockets done

  Then "the artist saw the default brush (brush) was chosen", ->
    (artist.pad.sawBrushChosen 'brush').should.equal(true)

  And "the guesser saw the default brush (brush) was chosen", ->
    (guesser.pad.sawBrushChosen 'brush').should.equal(true)


  And "the artist saw the drawing actions", ->
    artist.pad.sawDrawStart(5,5).should.equal(true)
    artist.pad.sawDrawMove(10,10).should.equal(true)
    artist.pad.sawDrawEnd().should.equal(true)

  And "the guesser saw the drawing actions", ->
    guesser.pad.sawDrawStart(5,5).should.equal(true)
    guesser.pad.sawDrawMove(10,10).should.equal(true)
    guesser.pad.sawDrawEnd().should.equal(true)

  after (done) ->
    context.dispose(done)
