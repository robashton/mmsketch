$(document).ready(function() {
  $.getJSON('/config', function(cfg) {
    FB.init({appId: cfg.appId, status: true, cookie: true}); 
  })
})
