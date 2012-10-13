ManualContext = require './context'

Scenario "Selecting an artpad brush", ->
  context = new ManualContext()
  bob = null

  Given "bob is on the artpad page", (done) ->
    context.start ->
      bob = context.add_client_called 'bob', ->
        bob.navigate_to_artpad done

  When "bob selects an artpad brush", (done) ->
    bob.select_brush 'pencil', done

  Then "that artpad brush is marked as selected", ->
    bob.selected_brush().should.equal('pencil')

  after (done) ->
    context.dispose done

