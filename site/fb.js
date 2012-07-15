$(document).ready(function() {
  if(TEST) return
  var script = document.createElement('script')
  var head = document.getElementsByTagName('head')[0]
  script.setAttribute('src', "http://connect.facebook.net/en_US/all.js")
  head.appendChild(script)
  script.onload = function() {
    $.getJSON('/config', function(cfg) {
      FB.init({appId: cfg.appId, status: true, cookie: true}); 
    })
  }
})
