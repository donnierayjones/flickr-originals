var express = require('express');
var favorites = require('./favorites-atom');
var photos = require('./photos-atom');
var config = require('./config_provider');

var app = express.createServer(express.logger());
var flickrUsername = config.get('FLICKR_USERNAME');

app.get('/', function(req, res) {
  res.send(flickrUsername + "'s flickr stuff!");
});

app.get('/photos.:format?', function(req, res) {
  if(req.params.format == 'atom') {
    photos(function(xml) {
      res.send(xml);
    });
  } else {
    res.redirect('http://flickr.com/photos/' + flickrUsername);
  }
});

app.get('/favorites.:format?', function(req, res) {
  if(req.params.format == 'atom') {
    favorites(function(xml) {
      res.send(xml);
    });
  } else {
    res.redirect('http://flickr.com/' + flickrUsername + '/favorites');
  }
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
