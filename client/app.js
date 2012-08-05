(function() {
  var game = null
  ,   statusDisplay = null
  ,   feedbackDisplay = null
  ,   roomScoresDisplay = null
  ,   personalStatusDisplay = null
  ,   feedbackTabs = null
  ,   playerListDisplay = null
  ,   sharing = null
  ,   artPad = null
  ,   input = null
  ,   timer = null

  var closeSockets = function() {
    game.stop()
  }

  function onGameStarted() {
    $('#loading').hide()
    $('#content').show()
  }

  if(TEST) {
    var testScript = document.createElement('script')
    var head = document.getElementsByTagName('head')[0]
    testScript.setAttribute('src', 'test.js')
    head.appendChild(testScript)
    testScript.onload = function() {
      $(document).ready(startGame)
    }
  } else {
    $(document).ready(startGame)
  }

  function startGame() {
    game = new Game()
    statusDisplay = new StatusDisplay(game)
    feedbackDisplay = new FeedbackDisplay(game)
    personalStatusDisplay = new PersonalStatusDisplay(game)
    playerListDisplay = new PlayerListDisplay(game)
    sharing = new Sharing(game)
    feedbackTabs = new FeedbackTabs()
    input = new Input(game)
    artPad = new ArtPadInput(game)
    timer = new Timer(game)
    game.on('Started', onGameStarted)
    game.start()
  }
  }());
