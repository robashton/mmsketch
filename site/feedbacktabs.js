(function(exports) {
  var FeedbackTabs = function() {
    this.clientFeedbackTab = $('#client-feedback-tab')
    this.clientFeedback = $('#client-feedback')
    this.roomFeedbackTab = $('#room-feedback-tab')
    this.roomFeedback = $('#room-feedback')
    this.clientFeedbackTab.click(_.bind(this.showClientFeedback, this))
    this.roomFeedbackTab.click(_.bind(this.showRoomFeedback, this))
    this.showClientFeedback()
  }

  FeedbackTabs.prototype = {
    showClientFeedback: function() {
      this.clientFeedbackTab.addClass('active')
      this.roomFeedbackTab.removeClass('active')
      this.clientFeedback.show()
      this.roomFeedback.hide()
    },
    showRoomFeedback: function() {
      this.clientFeedbackTab.removeClass('active')
      this.roomFeedbackTab.addClass('active')
      this.clientFeedback.hide()
      this.roomFeedback.show()
    }
  }
  exports.FeedbackTabs = FeedbackTabs
})(this)
