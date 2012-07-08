should = require('should')
_ = require('underscore')
ManualContext = require('./context')

Scenario "An unauthenticated user", (done) ->
  context = new ManualContext()
  unknownUser = null
  knownUser = null

  When "An anonymous user joins", (done) ->
    context.start ->
      unknownUser = context.add_anonymous_client()
      knownUser = context.add_client_called 'bob'
      context.wait_for_all_clients done
  
  Then "They are redirected to a login page", ->
    unknownUser.was_redirected().should.equal(true)

  And "They don't add to the total player count", ->
    knownUser.clientCount().should.include('only player')

Scenario "An authenticated user tries to play twice", (done) ->
  context = new ManualContext()
  attemptOne = null
  attemptTwo = null

  When "An authenticated user joins", (done) ->
    context.start ->
      attemptOne = context.add_client_called 'bob', done

  And "Joins again", (done) ->
    attemptTwo = context.add_client_called 'bob', done

  Then "The first attempt joins the game", ->
    attemptOne.isWaiting().should.equal(true)

  And "The second attempt is told to sod off", ->
    attemptTwo.clientStatus().should.include('cheating')

