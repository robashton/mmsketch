(function(exports) {
  
  var Sharing = function(game) {
    this.game = game
    this.game.autoHook(this)
    this.lastRoundId = null
    this.shareButton = $('#share-drawing')
    this.shareButton.on('click', _.bind(this.onShareClicked, this))
  }

  Sharing.prototype = {
    onPersonalInfoReceived: function(data) {
      FB.init({appId: data.appId, status: true, cookie: true}); 
    },
    onRoundStarted: function() {
      this.shareButton.hide()
    },
    onLastRoundId: function(id) {
      this.lastRoundId = id
      this.shareButton.show()
    },
    onShareClicked: function() {
      var obj = {
        method: 'feed',
        link: 'http://wedrawthings.com/viewround/' + this.lastRoundId,
        picture: 'http://fbrell.com/f8.jpg',
        name: 'We Draw Things',
        caption: 'We drew something',
        description: 'Take a look at this!'
      };

      FB.ui(obj, function() {

      });
      }
  }
  exports.Sharing = Sharing

}(this))
