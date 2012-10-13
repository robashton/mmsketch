ManualContext = require('./context')

Scenario "Already logged in", ->
  context = new ManualContext()
  bob = null

  Given "bob is on the home page", (done) ->
    context.start ->
      bob = context.add_client_called 'bob', done

  When "bob tries to start drawing", (done) ->
    bob.navigate_to_artpad done

  Then "bob is allowed to start drawing", ->
    bob.was_redirected_to('/login').should.equal(false)

  after (done) ->
    context.dispose done
