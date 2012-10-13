ManualContext = require('./context')

Scenario "Viewing the artpad", ->
  context = new ManualContext()
  bob = null

  Given "bob is on the home page", (done) ->
    context.start ->
      bob = context.add_client_called 'bob', done

  When "bob navigates to the artpad", (done) ->
    bob.navigate_to_artpad done

  Then "The paint brushes should be visible", ->
    bob.count_visible_elements('.paintbrush-brush').should.not.equal(0)

  And "the paint colours should be visible", ->
    bob.count_visible_elements('.paintbrush-colour').should.not.equal(0)

  after (done) ->
    context.dispose done
