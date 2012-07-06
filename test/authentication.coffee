should = require('should')
_ = require('underscore')
ManualContext = require('./context')

Scenario "An unauthenticated user", (done) ->
  context = new ManualContext()
  unknownUser = null

  When "An anonyous user joins", (done) ->
    context.start ->
      unknownUser = context.add_anonymous_client done
  
  Then "They are asked to authentiate", ->
    unknownUser.clientStatus().should.include('please login')

  And "They don't add to the total player count", ->
    unknownUser.clientCount().should.include('0 players')

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
    attemptOne.clientStatus().should.include('cheating')

