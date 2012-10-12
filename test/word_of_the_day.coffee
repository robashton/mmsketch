ManualContext = require('./context')

Scenario "Viewing the word of the day", ->
  context = new ManualContext()
  bob = null

  Given "The word of the day is 'flibble'", (done) ->
    context.set_word_of_the_day 'flibble'
    context.start done

  When "bob loads the home page", (done) ->
    bob = context.add_client_called 'bob', done

  Then "bob should see the word of the day is 'flibble'", ->
    bob.word_of_the_day().should.equal('flibble')

  after (done) ->
    context.dispose(done)
