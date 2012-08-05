$(document).ready(function() {
  var playerName = $('#player-name'),
      playerAvatar = $('#player-avatar'),
      playerPoints = $('#player-points'),
      recentGames = $('#recent-games'),
      drawnWord = $('#drawn-word'),
      shareButton = $('#share-art'),
      roundId = parseRoundIdFromUrl(),
      artData = null

  $('#image-for-facebook > img')
    .attr('src', '/drawings/' + roundId)

  $.getJSON('/round/' + roundId, function(data) {
    artData = data
    playerName.text(data.player.displayName)
    playerAvatar.attr('src', 'https://graph.facebook.com/' + 
      data.player.username + '/picture')
    playerPoints.text(data.player.score)
    drawnWord.text(data.word + ' by ' + data.player.displayName)
    $('#loading').hide()
    $('#content').show()
    shareButton.show()
    shareButton.click(shareDrawing) 
    var replayGame = new ReplayGame(data.events)
    var artPad = new ArtPadInput(replayGame)
    replayGame.start()
  })

  $.getJSON('/recent', function(data) {
    for(var i in data) {
      var recentRoundId = data[i]
      recentGames.append(
        $('<a/>').html(
          $('<img/>').attr('src', '/drawings/' + recentRoundId)
        ).attr('href', '/viewround/' + recentRoundId)
      )
    }
  })

  function parseRoundIdFromUrl() {
    var url = document.location.pathname
    return url.substr(url.lastIndexOf('/') + 1)
  }

  function shareDrawing() {
    var obj = {
      method: 'feed',
      link: 'http://wedrawthings.com/viewround/' + roundId,
      picture: 'http://wedrawthings.com/drawings/' + roundId,
      name: 'We Draw Things',
      caption: 'A drawing of "' + artData.word + '" by "' + artData.player.displayName  + '"',
      display: 'popup'
    };

    FB.ui(obj, function() {

    });
  }
})

