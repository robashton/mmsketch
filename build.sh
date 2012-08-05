cat client/eventable.js client/statusdisplay.js client/feedbackdisplay.js client/feedbacktabs.js client/playerlistdisplay.js client/sharing.js client/game.js client/input.js client/canvas.js client/artpad.js client/artpadinput.js client/timer.js client/personalstatus.js client/app.js > client/raw.js

cat client/eventable.js client/statusdisplay.js client/feedbackdisplay.js client/feedbacktabs.js client/playerlistdisplay.js client/sharing.js client/game.js client/input.js client/canvas.js client/artpad.js client/artpadinput.js client/timer.js client/personalstatus.js client/replaygame.js client/replayapp.js > client/rawreplay.js

uglifyjs client/raw.js > site/game.js
uglifyjs client/rawreplay.js > site/replay.js
