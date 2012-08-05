(function(e){_=typeof _=="undefined"?require("underscore"):_;var t=function(e){this.handlers=[],this.defaultContext=e};t.prototype={raise:function(e,t){var n=this.handlers.length;for(var r=0;r<n;r++){var i=this.handlers[r];i.method.call(i.context||this.defaultContext,t,e)}},add:function(e,t){this.handlers.push({method:e,context:t})},remove:function(e,t){this.handlers=_(this.handlers).filter(function(n){return n.method!==e||n.context!==t})}};var n=function(){this.eventListeners={},this.allContainer=new t(this),this.eventDepth=0};n.prototype={autoHook:function(e){for(var t in e)t.indexOf("on")===0&&this.on(t.substr(2),e[t],e)},autoUnhook:function(e){for(var t in e)t.indexOf("on")===0&&this.off(t.substr(2),e[t],e)},once:function(e,t,n){var r=this,i=function(s,o){t.call(this,s,o),r.off(e,i,n)};this.on(e,i,n)},on:function(e,t,n){this.eventContainerFor(e).add(t,n)},off:function(e,t,n){this.eventContainerFor(e).remove(t,n)},onAny:function(e,t){this.allContainer.add(e,t)},raise:function(e,t,n){this.audit(e,t);var r=this.eventListeners[e];r&&r.raise(n||this,t),this.allContainer.raise(n||this,{event:e,data:t})},audit:function(e,t){},eventContainerFor:function(e){var n=this.eventListeners[e];return n||(n=new t(this),this.eventListeners[e]=n),n}},typeof module!="undefined"&&module.exports?module.exports=n:e.Eventable=n}).call(this,this),function(e){var t=function(e){this.clientCount=$("#client-count"),this.clientStatus=$("#client-status"),e.autoHook(this)};t.prototype={onStatusUpdate:function(e){this.updateStatusMessage(e),this.updatePlayerCount(e)},onRoundEnded:function(e){this.setStatusMessageTo("Waiting for the next round")},onNeedAuth:function(){window.location="/login"},onRejected:function(){this.setStatusMessageTo("Multiple logins from the same account forbidden to prevent cheating")},updateStatusMessage:function(e){switch(e.status){case"drawing":return this.setStatusMessageTo("Drawing the word "+e.word);case"guessing":return this.setStatusMessageToGuessing(e);case"waiting":return this.setStatusMessageTo("Waiting for other players to join")}},updatePlayerCount:function(e){e.clientCount===1?this.setCountMessageTo("You are the only player, invite your friends to join"):this.setCountMessageTo("There are "+e.clientCount+" players online")},setCountMessageTo:function(e){this.clientCount.text(e)},setStatusMessageToGuessing:function(e){var t=$("<span/>").append($("<img/>").attr("src",e.player.displayPicture).css("height","25px")).append($("<h4/>").text(e.player.displayName+" is drawing"));this.clientStatus.html(t)},setStatusMessageTo:function(e){this.clientStatus.text(e)}},e.StatusDisplay=t}(this),function(e){var t=function(e){this.feedbackContainer=$("#feedback-container"),this.clientFeedback=$("#client-feedback"),this.game=e,this.game.autoHook(this)};t.prototype={onWrongGuess:function(e){this.addMessage(e.player.displayPicture,e.player.displayName+": "+e.word)},onMyCorrectGuess:function(e){this.addMessage("img/happyface.png","You guessed "+e.word+" correctly! Now let's wait for the slow mo's")},onOtherCorrectGuess:function(e){this.addMessage(e.player.displayPicture,e.player.displayName+" guessed the word correctly")},onRoundEnded:function(e){e.winner?this.addMessage("img/happyface.png","The word was correctly guessed as "+e.word):this.addMessage("img/shockedface.png","Nobody guessed the word "+e.word)},addPlayerGuessedFirstMessage:function(e){this.addMessage(e.player.displayPicture,e.player.displayName+"guessed the word "+e.word+"first")},addMessage:function(e,t){var n=$("<span/>").append($("<img/>").attr("src",e)).append($("<p/>").text(t));this.clientFeedback.append(n),this.feedbackContainer.get(0).scrollTop=this.feedbackContainer.get(0).scrollHeight}},e.FeedbackDisplay=t}(this),function(e){var t=function(){this.clientFeedbackTab=$("#client-feedback-tab"),this.clientFeedback=$("#client-feedback"),this.roomFeedbackTab=$("#room-feedback-tab"),this.roomFeedback=$("#room-feedback"),this.clientFeedbackTab.click(_.bind(this.showClientFeedback,this)),this.roomFeedbackTab.click(_.bind(this.showRoomFeedback,this)),this.showClientFeedback()};t.prototype={showClientFeedback:function(){this.clientFeedbackTab.addClass("active"),this.roomFeedbackTab.removeClass("active"),this.clientFeedback.show(),this.roomFeedback.hide()},showRoomFeedback:function(){this.clientFeedbackTab.removeClass("active"),this.roomFeedbackTab.addClass("active"),this.clientFeedback.hide(),this.roomFeedback.show()}},e.FeedbackTabs=t}(this),function(e){var t=function(e){this.game=e,this.game.autoHook(this),this.initialised=!1,this.playerElements={},this.playerList=$("#room-feedback")};t.prototype={onJoinedGame:function(e){for(var t in e)this.addPlayer(e[t]);this.initialised=!0},onScoresUpdated:function(e){for(var t in e){var n=e[t];this.updatePlayerScore(n.player,n.score)}},updatePlayerScore:function(e,t){var n=this.playerElements[e];if(!n)return;n.find(".score").text(t);var r=this.findTargetElementAfterScoring(t,n.prev());r&&n.insertBefore(r)},findTargetElementAfterScoring:function(e,t,n){if(t.length===0)return n;var r=t.find(".score").text(),i=parseInt(r,10);return i<e?(n=t,t=n.prev(),this.findTargetElementAfterScoring(e,t,n)):n},onPlayerJoined:function(e){if(!this.initialised)return;this.addPlayer(e)},onPlayerLeft:function(e){if(!this.initialised)return;this.removePlayer(e)},addPlayer:function(e){if(this.playerElements[e.id])return;var t=$("<span/>").append($("<img/>").attr("src",e.displayPicture)).append($("<p/>").text(e.displayName)).append($("<p/>").html('( <span class="score">'+e.gameScore+"</span> )")).data("userid",e.id);this.playerList.append(t),this.playerElements[e.id]=t},removePlayer:function(e){var t=this.playerElements[e.id];if(!t)return;delete this.playerElements[e.id],t.remove()}},e.PlayerListDisplay=t}(this),function(e){var t=function(e){this.game=e,this.game.autoHook(this),this.lastRoundId=null,this.lastArtist=null,this.shareButton=$("#share-drawing"),this.shareButton.on("click",_.bind(this.onShareClicked,this))};t.prototype={onRoundStarted:function(){this.shareButton.hide()},onRoundEnded:function(e){this.lastWord=e.word},onLastRoundId:function(e){this.lastRoundId=e,this.shareButton.show()},onShareClicked:function(){var e={method:"feed",link:"http://wedrawthings.com/viewround/"+this.lastRoundId,picture:"http://wedrawthings.com/drawings/"+this.lastRoundId,name:"We Draw Things",caption:'A drawing of "'+this.lastWord+'"',display:"popup"};FB.ui(e,function(){})}},e.Sharing=t}(this),function(e){var t=function(){Eventable.call(this),this.socket=null,this.started=!1,this.roundstarted=!1,this.status="waiting"};t.prototype={start:function(){this.socket=io.connect(),this.socket.on("status",_.bind(this.onServerStatus,this)),this.socket.on("wrong",_.bind(this.onWrongGuess,this)),this.socket.on("correct",_.bind(this.onCorrectGuess,this)),this.socket.on("startround",_.bind(this.onRoundStarted,this)),this.socket.on("endround",_.bind(this.onRoundEnded,this)),this.socket.on("reject",_.bind(this.onReject,this)),this.socket.on("error",_.bind(this.onError,this)),this.socket.on("drawingstart",_.bind(this.onDrawingStart,this)),this.socket.on("drawingmove",_.bind(this.onDrawingMove,this)),this.socket.on("drawingend",_.bind(this.onDrawingEnd,this)),this.socket.on("countdown",_.bind(this.onCountdown,this)),this.socket.on("selectbrush",_.bind(this.onBrushSelected,this)),this.socket.on("selectcolour",_.bind(this.onColourSelected,this)),this.socket.on("you",_.bind(this.onPersonalInfoReceived,this)),this.socket.on("globalscorechanged",_.bind(this.onGlobalScoreChanged,this)),this.socket.on("playerjoined",_.bind(this.onPlayerJoined,this)),this.socket.on("playerleft",_.bind(this.onPlayerLeft,this)),this.socket.on("scorechanges",_.bind(this.onScoreChanges,this)),this.socket.on("lastroundid",_.bind(this.onLastRoundId,this)),this.socket.on("joinedgame",_.bind(this.onJoinedGame,this))},stop:function(){this.socket.disconnect()},submitWord:function(e){this.socket.emit("guess",e)},onLastRoundId:function(e){this.raise("LastRoundId",e)},onPlayerJoined:function(e){this.raise("PlayerJoined",e)},onPlayerLeft:function(e){this.raise("PlayerLeft",e)},onJoinedGame:function(e){this.raise("JoinedGame",e)},onPersonalInfoReceived:function(e){this.raise("PersonalInfoReceived",e)},onGlobalScoreChanged:function(e){this.raise("GlobalScoreChanged",e)},onScoreChanges:function(e){this.raise("ScoresUpdated",e)},onReject:function(){this.raise("Rejected"),this.status="rejected"},onError:function(e){e==="handshake error"&&this.raise("NeedAuth")},onCountdown:function(e){this.raise("Countdown",e)},onServerStatus:function(e){this.status=e.status,this.clientCount=e.clientCount,this.raise("StatusUpdate",e),this.started||(this.started=!0,this.raise("Started"))},onWrongGuess:function(e){this.raise("WrongGuess",e)},onCorrectGuess:function(e){e.win?(this.status="waiting",this.raise("MyCorrectGuess",e)):this.raise("OtherCorrectGuess",e)},onRoundStarted:function(){this.raise("RoundStarted")},onRoundEnded:function(e){this.raise("RoundEnded",e)},isDrawing:function(){return this.status==="drawing"},sendDrawingStart:function(e){if(!this.isDrawing())return;this.socket.emit("drawingstart",e),this.onDrawingStart(e)},sendDrawingMove:function(e){if(!this.isDrawing())return;this.socket.emit("drawingmove",e),this.onDrawingMove(e)},sendDrawingEnd:function(e){if(!this.isDrawing())return;this.socket.emit("drawingend",e),this.onDrawingEnd(e)},sendSelectBrush:function(e){if(!this.isDrawing())return;this.socket.emit("selectbrush",e),this.onBrushSelected(e)},sendSelectColour:function(e){if(!this.isDrawing())return;this.socket.emit("selectcolour",e),this.onColourSelected(e)},onDrawingStart:function(e){this.raise("DrawingStart",e)},onDrawingMove:function(e){this.raise("DrawingMove",e)},onDrawingEnd:function(e){this.raise("DrawingEnd",e)},onBrushSelected:function(e){this.raise("BrushSelected",e)},onColourSelected:function(e){this.raise("ColourSelected",e)}},_.extend(t.prototype,Eventable.prototype),e.Game=t}(this),function(e){var t=function(e){this.game=e,this.textInputContainer=$("#client-input-container"),this.textInput=$("#client-input"),this.textInputButton=$("#client-input-button"),this.paintInputContainer=$("#client-paintbrush-container"),e.autoHook(this),this.textInputButton.click(_.bind(this.onInputButtonClick,this)),this.textInput.keydown(_.bind(this.onInputKeyDown,this))};t.prototype={onStatusUpdate:function(e){switch(e.status){case"waiting":return this.statusWaiting();case"drawing":return this.statusDrawing();case"guessing":return this.statusGuessing()}},onMyCorrectGuess:function(){this.statusWaiting()},statusWaiting:function(){this.textInputContainer.hide(),this.paintInputContainer.hide()},statusDrawing:function(){this.paintInputContainer.show(),this.textInputContainer.hide()},statusGuessing:function(){this.paintInputContainer.hide(),this.textInputContainer.show(),this.textInput.focus()},onInputButtonClick:function(){this.submitText()},onInputKeyDown:function(e){e.keyCode===13&&this.submitText()},submitText:function(){var e=this.textInput.val();this.textInput.val(""),this.game.submitWord(e),this.textInput.focus()}},e.Input=t}.call(this,this),function(e){var t=function(e,t,n){this.canvas=document.getElementById(e)||document.createElement("canvas"),this.canvas.width=t||this.canvas.width,this.canvas.height=n||this.canvas.height,this.context=this.canvas.getContext("2d"),this.width=t,this.height=n};t.prototype={},t.createImage=function(e){var t=new Image;return t.src="/"+e,t},e.Canvas=t}(window),function(e){function n(e,t,n){var r=t.x-e.x,i=t.y-e.y,s=Math.sqrt(r*r+i*i);r/=s,i/=s;var o={x:-i,y:r},u={x:i,y:-r},a={x:e.x+n*e.mag*o.x,y:e.y+n*e.mag*o.y},f={x:e.x+n*e.mag*u.x,y:e.y+n*e.mag*u.y},l={x:t.x+n*t.mag*o.x,y:t.y+n*t.mag*o.y},c={x:t.x+n*t.mag*u.x,y:t.y+n*t.mag*u.y};return{bl:a,br:f,tl:l,tr:c,cx:(a.x+c.x)/2,cy:(a.y+c.y)/2,width:Math.abs(a.x-c.x)}}function i(e,t,n){return s(e),s(t),e[1]>=.9&&(e[0]=t[0]),n[0]=.05*(e[0]*19+t[0]),n[1]=.05*(e[1]*19+t[1]),n[2]=.5*(e[2]+t[2]),t[3]===0?n[3]=0:n[3]=255,n=o(n),n}function s(e){e[0]/=255,e[1]/=255,e[2]/=255;var t=Math.max(e[0],e[1],e[2]),n=Math.min(e[0],e[1],e[2]),r=(n+t)/2,i=t-n,s=0,o=0,u,a,f=0;if(n===t){e[0]=0,e[1]=r,e[2]=0;return}r<=.5?o=i/(t+n):o=i/(2-t-n),u=(t-e[0])/i,a=(t-e[1])/i,f=(t-e[2])/i,e[0]===t?s=f-a:e[1]===t?s=2+u-f:s=4+a-u,s=s/6%1,e[0]=s,e[1]=r,e[2]=o}function o(e){var t=1/3,n=0,r=0;return e[2]===0?[e[1]*255,e[1]*255,e[1]*255,e[3]]:(e[1]<=.5?n=e[1]*(1+e[2]):n=e[1]+e[2]-e[1]*e[2],r=2*e[1]-n,[u(r,n,e[0]+t),u(r,n,e[0]),u(r,n,e[0]-t),e[3]])}function u(e,t,n){var r=1/6,i=2/3,s=0;return n%=1,n<0&&(n+=1),n<r?s=e+(t-e)*n*6:n<.5?s=t:n<i?s=e+(t-e)*(i-n)*6:s=e,s*=255,s}var t=function(e){this.lastPosition=null,this.selectedBrush=null,this.canvas=new e("surface",800,600),this.context=this.canvas.context,this.selectedColour=null,this.history=[],this.totalDistanceMoved=0,this.distanceLastMoved=0,this.numberOfSteps=0,this.averageDistanceMoved=0,this.status=null,this.clear(),this.offscreen=new e("offscreen1",100,100),this.offscreencontext=this.offscreen.context,this.paintBrushImage=e.createImage("img/paintbrush.png");var t=this;this.paintBrushImage.onload=function(){t.offscreencontext.clearRect(0,0,100,100),t.offscreencontext.drawImage(t.paintBrushImage,0,0,100,100)}};t.prototype={clear:function(){this.context.fillStyle="#FFF",this.context.globalAlpha=1,this.context.clearRect(0,0,this.canvas.width,this.canvas.height)},startDrawing:function(e){this.lastPosition=e,this.totalDistanceMoved=0,this.distanceLastMoved=0,this.status="starting"},draw:function(e){this.addToDistances(e),this.drawLine(this.lastPosition,e),this.lastPosition=e},stopDrawing:function(){this.status="ending",this.drawLine(this.lastPosition,this.lastPosition),this.lastPosition=null,this.history=[],this.lastQuad=null,this.numberOfSteps=0},drawLine:function(e,t){this.context.save(),r[this.selectedBrush](e,t,this),this.context.restore()},setBrush:function(e){this.selectedBrush=e},setBrushColour:function(e){this.selectedColour=e},addToDistances:function(e){this.numberOfSteps++;var t=e.x-this.lastPosition.x,n=e.y-this.lastPosition.y;this.distanceLastMoved=Math.sqrt(t*t+n*n),this.totalDistanceMoved+=this.distanceLastMoved,this.averageDistanceMoved=(this.distanceLastMoved+this.averageDistanceMoved*4)/5,e.mag=this.averageDistanceMoved,this.history.push(e)}};var r={pen:function(e,t,r){if(r.history.length<5)return;var i=[],s=0;r.lastQuad?i[0]=r.lastQuad:i[0]=n(r.history[s++],r.history[s],.25);while(s<r.history.length-1)i.push(n(r.history[s++],r.history[s],.25));r.context.strokeStyle=r.selectedColour,r.context.fillStyle=r.selectedColour,r.context.lineWidth=1,r.context.globalAlpha=1,r.context.lineJoin="miter",r.context.beginPath(),r.context.moveTo(i[0].tl.x,i[0].tl.y);for(var o=1;o<i.length;o++)r.context.quadraticCurveTo(i[o].bl.x,i[o].bl.y,i[o].tl.x,i[o].tl.y);r.context.lineTo(i[i.length-1].tr.x,i[i.length-1].tr.y);for(o=i.length-1;o>0;o--)r.context.quadraticCurveTo(i[o].br.x,i[o].br.y,i[o-1].tr.x,i[o-1].tr.y);r.context.lineTo(i[0].tl.x,i[0].tl.y),r.context.closePath(),r.context.fill(),r.context.stroke(),r.status==="starting"&&(r.status="drawing"),r.lastQuad=i[i.length-1];var u=r.history;r.history=[],r.history.push(u.pop())},brush:function(e,t,r){if(r.history.length<2)return;var i=n(r.history[0],r.history[1],3);r.history=[];var s,o,u="",a,f,l=0,c=r.selectedColour;c.length===4?(s=c[1]+c[1],o=c[2]+c[2],u=c[3]+c[3]):(s=c.substr(1,2),o=c.substr(3,2),u=c.substr(5,2)),a=parseInt(s,16),f=parseInt(o,16),l=parseInt(u,16);var h=r.offscreencontext.getImageData(0,0,100,100);for(var p=0;p<100;p++)for(var d=0;d<100;d++){var v=(p+d*100)*4;h.data[v]=a,h.data[v+1]=f,h.data[v+2]=l}r.offscreencontext.putImageData(h,0,0),r.context.globalAlpha=.02,r.context.drawImage(r.offscreen.canvas,i.cx-50,i.cy-50,100,100)},pencil:function(e,t,n){if(n.history.length<5)return;n.context.globalAlpha=1/(n.averageDistanceMoved/5),n.context.lineWidth=2,n.context.strokeStyle=n.selectedColour,n.context.beginPath(),n.context.moveTo(n.history[0].x,n.history[0].y);for(var r=1;r<n.history.length;r++)n.context.lineTo(n.history[r].x,n.history[r].y);n.context.stroke();var i=n.history[n.history.length-1];n.history=[i]}};t.hls2rgb=o,t.rgb2hls=s,t.blendRgb=i,typeof module!="undefined"&&module.exports?module.exports=t:e.ArtPad=t}(this),function(e){var t=function(e){this.game=e,this.canvas=document.getElementById("surface"),this.context=this.canvas.getContext("2d"),this.pad=new ArtPad(Canvas),this.colourContainer=$("#paintbrush-colours"),this.brushContainer=$("#paintbrush-brushes"),this.colours={},this.brushes={},this.game.autoHook(this),this.createPalette(),this.selectColour("#000"),this.selectBrush("circle"),this.hookDrawingInput()};t.prototype={hookDrawingInput:function(){var e=this;$("#surface").hammer({prevent_default:!0,drag_min_distance:1}).on({dragstart:_.bind(this.onDragStart,this),drag:_.bind(this.onDrag,this),dragend:_.bind(this.onDragEnd,this)}),$(".paintbrush-brush").hammer({prevent_defaults:!0}).on({tap:function(){var t=$(this).data("brush");e.game.sendSelectBrush(t)}}),$(".paintbrush-colour").hammer({prevent_defaults:!0}).on({tap:function(){var t=$(this).data("colour");e.game.sendSelectColour(t)}})},onDragStart:function(e){var t=this.screenToCanvas(e.position);this.game.sendDrawingStart(t)},onDrag:function(e){var t=this.screenToCanvas(e.position);this.game.sendDrawingMove(t)},onDragEnd:function(e){this.game.sendDrawingEnd()},onRoundStarted:function(){this.pad.clear(),this.game.sendSelectBrush(this.selectedBrush.data("brush")),this.game.sendSelectColour(this.selectedColour.data("colour"))},onDrawingStart:function(e){this.pad.startDrawing(e)},onDrawingMove:function(e){this.pad.draw(e)},onDrawingEnd:function(e){this.pad.stopDrawing()},onBrushSelected:function(e){this.selectBrush(e)},onColourSelected:function(e){this.selectColour(e)},createPalette:function(){this.addColour("#FFF"),this.addColour("#000"),this.addColour("#F00"),this.addColour("#0F0"),this.addColour("#00F"),this.addColour("#FF0"),this.addColour("#F0F"),this.addColour("#0FF"),this.addColour("#FFA500"),this.addBrush("pen"),this.addBrush("pencil"),this.addBrush("brush")},addColour:function(e){var t=$("<span/>").attr("data-colour",e).css("background-color",e).addClass("paintbrush-colour");return this.colourContainer.append(t),this.colours[e]=t,t},selectColour:function(e){var t=this.colours[e];if(!t)return;this.selectedColour&&this.selectedColour.removeClass("selected"),this.selectedColour=t,this.selectedColour.addClass("selected"),this.pad.setBrushColour(e)},addBrush:function(e){var t=$("<span/>").addClass("paintbrush-brush").addClass(e).data("brush",e).append($("<img/>").attr("src","/img/"+e+".png"));return this.brushContainer.append(t),this.brushes[e]=t,t},selectBrush:function(e){var t=this.brushes[e];if(!t)return;this.selectedBrush&&this.selectedBrush.removeClass("selected"),this.selectedBrush=t,this.selectedBrush.addClass("selected"),this.pad.setBrush(e)},screenToCanvas:function(e){var t=this.canvas.width,n=this.canvas.height,r=$(this.canvas).width(),i=$(this.canvas).height(),s=t/r,o=n/i;return{x:e.x*s,y:e.y*o}}},e.ArtPadInput=t}(this),function(e){var t=function(e){this.game=e,this.timerText=$("#timer-text"),this.game.autoHook(this)};t.prototype={onStatusUpdate:function(e){e.status==="waiting"?this.timerText.hide():this.timerText.show()},onRoundEnded:function(){this.timerText.text("Next round starting shortly")},onCountdown:function(e){this.timerText.text(e+" seconds left")}},e.Timer=t}.call(this,this),function(e){var t=function(e){this.game=e,this.score=$("#player-score"),this.gameScore=$("#player-game-score"),this.avatar=$("#player-avatar"),this.name=$("#player-name"),this.game.autoHook(this)};t.prototype={onPersonalInfoReceived:function(e){this.score.text(""+e.globalScore),this.gameScore.text(""+e.gameScore),this.name.text(e.displayName),this.avatar.attr("src",e.displayPicture)},onGlobalScoreChanged:function(e){this.score.text(""+e.score),this.gameScore.text(""+e.gameScore)}},e.PersonalStatusDisplay=t}(this),function(){function h(){$("#loading").hide(),$("#content").show()}function v(){e=new Game,t=new StatusDisplay(e),n=new FeedbackDisplay(e),i=new PersonalStatusDisplay(e),o=new PlayerListDisplay(e),u=new Sharing(e),s=new FeedbackTabs,f=new Input(e),a=new ArtPadInput(e),l=new Timer(e),e.on("Started",h),e.start()}var e=null,t=null,n=null,r=null,i=null,s=null,o=null,u=null,a=null,f=null,l=null,c=function(){e.stop()};if(TEST){var p=document.createElement("script"),d=document.getElementsByTagName("head")[0];p.setAttribute("src","test.js"),d.appendChild(p),p.onload=function(){$(document).ready(v)}}else $(document).ready(v)}();