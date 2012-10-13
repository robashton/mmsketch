ManualContext = require('./context')

Scenario "Required to log in", ->
  context = new ManualContext()
  anonymous = null

  Given "an anonymous user on the home page", (done) ->
    context.start ->
      anonymous = context.add_anonymous_client done

  When "the anonymous user tries to start drawing", (done) ->
    anonymous.navigate_to_artpad done

  Then "the anonymous user is re-directed to the log-in system", ->
    anonymous.was_redirected_to('/login').should.equal(true)

  after ->
    context.dispose()
