_ = require('underscore')
find_artist = require('./util').find_artist
ManualContext = require('./context')

Scenario "Multiple games running due to excess of players", ->
  context = new ManualContext()
  bob = null
  alice = null
  james = null
  hilda = null
  
  Given "a server running with a size limit of 2", (done) ->
    context.set_room_size(2)
    context.start done

  When "alice and bob join the server", (done) ->
    bob = context.add_client_called 'bob'
    alice = context.add_client_called 'alice'
    context.wait_for_all_clients done


  And "james and hilda join the server", (done) ->
    james = context.add_client_called 'james'
    hilda = context.add_client_called 'hilda'
    context.wait_for_all_clients done

  Then "bob and alice are in the same room", ->
    (bob.player_list_has_player 'alice')
      .should.equal(true)
    (alice.player_list_has_player 'bob')
      .should.equal(true)

  And "james and hilda are in the same room", ->
    (james.player_list_has_player 'hilda')
      .should.equal(true)
    (hilda.player_list_has_player 'james')
      .should.equal(true)

  And "bob and james are not in the same room", ->
    (bob.player_list_has_player 'james')
      .should.equal(false)
    (james.player_list_has_player 'bob')
      .should.equal(false)
    


Scenario "Players leaving games and being replaced by other players", ->
  context = new ManualContext()
  bob = null
  alice = null
  james = null
  hilda = null
  jenny = null

  Given "A server running with a size limit of 2", (done) ->
    context.set_room_size 2
    context.start done

  And "alice and bob are in room 1", (done) ->
    bob = context.add_client_called 'bob'
    alice = context.add_client_called 'alice'
    context.wait_for_all_clients done
    
  And "james and hilda are in room 2", (done) ->
    james = context.add_client_called 'james'
    hilda = context.add_client_called 'hilda'
    context.wait_for_all_clients done

  When "bob leaves room 1", (done) ->
    bob.close done

  And "jenny joins the server", (done) ->
    jenny = context.add_client_called 'jenny', done

  Then "jenny is in room 1", ->
    (jenny.player_list_has_player 'alice').should.equal(true)
    (alice.player_list_has_player 'jenny').should.equal(true)
    (hilda.player_list_has_player 'alice').should.equal(false)
    (james.player_list_has_player 'alice').should.equal(false)

  

