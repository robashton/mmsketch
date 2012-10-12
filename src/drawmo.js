define(function(require) {
  var currentWord = ''

  process.on('message', function(data) {
    if(data.msg === 'setCurrentWord')
      currentWord = data.word
  })

  return {
    currentWord: function() {
      return currentWord
    }
  }
})
