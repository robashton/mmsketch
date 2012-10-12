ManualContext = require('./context')

Scenario "Loading the home page", ->
  context = new ManualContext()
  bob = null

  Given "The server is running", (done) ->
    context.start done

  When "bob loads the home page", (done) ->
    bob = context.add_client_called 'bob', done

  Then "bob sees the home page", ->
    bob.page_title().should.equal('drawmo')

  after (done) ->
    context.dispose(done)



