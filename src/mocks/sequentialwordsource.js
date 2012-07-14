var SequentialWordSource = function() {
  this.words = process.env.words.split(',')
}

SequentialWordSource.prototype.next = function() {
  return this.words.shift() || "blah"
}


module.exports = SequentialWordSource
