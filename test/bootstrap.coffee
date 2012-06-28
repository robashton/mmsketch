Browser = require 'zombie'
GameServer = require '../src/gameserver'

class ManualContext
  @browser = new Browser()
  @server = new GameServer
  @port = 8080

  start: =>
    @server.listen(@port)

  browse_to_index: (done) =>
    @browser.visit 'http://localhost:' + @port, done

  element_exists: =>
    count = @browser.findAll('canvas')
    count == 1

Scenario "Bootstrapping the game", ->
  context = new ManualContext()

  Given "Nothing is running yet", -> ""
  When "Starting the server", context.start
  And "Navigating to the index", context.browse_to_index
  Then "The home page should contain a canvas", ->
    assert.that(context.element_exists('canvas'))

