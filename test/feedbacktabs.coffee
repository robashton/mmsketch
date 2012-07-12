should = require('should')
_ = require('underscore')
ManualContext = require('./context')

Scenario "Bob playing with tabs", ->
  context = new ManualContext()
  bob = null

  Given "Bob is waiting for other players to join", (done) ->
    context.start ->
      bob = context.add_client_called 'bob', done

  When "bob doesn't do anything to the tabs", -> ""
  Then "The client feedback tab is visible", ->
    bob.can_see('#client-feedback').should.equal(true)

  And "the room feedback tab is hidden", ->
    bob.can_see('#room-feedback').should.equal(false)

  When "bob clicks the room feedback tab", (done) ->
    bob.click('#room-feedback-tab', done)

  Then "the client feedback tab is hidden", ->
    bob.can_see('#client-feedback').should.equal(false)

  And "the room feedback tab is visible", ->
    bob.can_see('#room-feedback').should.equal(true)

  When "bob clicks the client feedback tab", (done) ->
    bob.click('#client-feedback-tab', done)

  Then "the client feedback tab is visible", ->
    bob.can_see('#client-feedback').should.equal(true)

  And "the room feedback tab is hidden", ->
    bob.can_see('#room-feedback').should.equal(false)
