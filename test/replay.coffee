should = require('should')
find_artist = require('./util').find_artist
ManualContext = require('./context')

Scenario "Replaying events from a finished game", ->
  context = new ManualContext()
  bob = null
  alice = null
  artist = null
  gameData = null

  Given "bob and alice are playing a game together", (done) ->
    context.next_word 'flibble'
    context.start ->
      bob = context.add_client_called 'bob'
      alice = context.add_client_called 'alice'
      context.wait_for_all_clients ->
        artist = find_artist [bob, alice]
        done()

  When "the artist picks a brush", ->
    artist.pad.doChooseBrush('hair')

  And "the artist picks a colour", ->
    artist.pad.doChooseColour('red')

  And "the artist draws a line", ->
    artist.pad.doDrawStart 1,1
    artist.pad.doDrawMove 2,2
    artist.pad.doDrawEnd()

  And "the round finishes",  (done) ->
    context.force_round_over done

  And "the game is requested from the endpoint", (done) ->
    artist.getJson '/round/' + context.last_round_id, (data) ->
      gameData = data
      done()

  Then "the artist name should be present in the response", ->
    gameData.player.username.should.equal artist.name

  And "the word being played should be present in the response", ->
    gameData.word.should.equal 'flibble'
    
  And "the first event should be picking a brush", ->
    gameData.events[0].event.should.equal 'selectbrush'
    gameData.events[0].data.should.equal 'hair'

  And "the second event should be picking a colour", ->
    gameData.events[1].event.should.equal 'selectcolour'
    gameData.events[1].data.should.equal 'red'

  And "the 3/4/5th event should be drawing a line", ->
    gameData.events[2].event.should.equal 'drawingstart'
    gameData.events[3].event.should.equal 'drawingmove'
    gameData.events[4].event.should.equal 'drawingend'
