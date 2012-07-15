should = require('should')
find_artist = require('../test/util').find_artist
ManualContext = require('../test/context')

players = []
playerCount = 100
roundCount = 1000
context = new ManualContext()
round = 1
for i in [1..roundCount]
  context.next_word 'word' + i


finish_test = ->
  context.dispose()

do_a_few_rounds = ->
  play_round = ->
    if(round >= roundCount)
      finish_test()
    console.log 'playing round ' + round
    do_round_moves ->
      round += 1
      setTimeout play_round, 100
  setTimeout play_round, 100

do_round_moves = (done) ->
  artist = find_artist players
  guesserCount = parseInt(Math.random() * 50)
  for i in [0..guesserCount]
    guesserid = parseInt(Math.random() * players.length)
    guesser = players[guesserid]
    if guesser is artist
      continue
    guesser.guess 'word' + round
  context.force_round_over done



  
Scenario "Playing games", ->
  Given "everybody is playing a game together long time", (done) ->
    context.start ->
      for i in [0..playerCount]
        name = 'player-' + i
        players[i] = context.add_client_called name
        console.log 'joining ' + name
      context.wait_for_all_clients do_a_few_rounds
      context.wait_for_closed done


