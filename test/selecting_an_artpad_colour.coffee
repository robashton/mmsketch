ManualContext = require './context'

Scenario "Selecting an artpad colour", ->
  context = new ManualContext()
  bob = null

  Given "bob is on the artpad page", (done) ->
    context.start ->
      bob = context.add_client_called 'bob', ->
        bob.navigate_to_artpad done

  When "bob selects an artpad colour", (done) ->
    bob.select_colour '#000', done

  Then "that artpad colour is marked as selected", ->
    bob.selected_colour().should.equal('#000')

  after (done) ->
    context.dispose done

