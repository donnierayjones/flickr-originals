var express = require('express');
var favorites = require('./favorites-atom');
var photos = require('./photos-atom');
var config = require('./config_provider');
var FlickrAPI = require('flickrnode').FlickrAPI;

var app = express(express.logger());
var flickr = new FlickrAPI(config.get('FLICKR_API_KEY'));

app.get('/', function(req, res) {
  res.send("flickr originals!");
});

app.get('/photos/:userid.:format?', function(req, res) {
  flickr.people.getInfo(req.params.userid, function(e, person) {
    if(req.params.format == 'atom') {
      photos(person, function(xml) {
        res.send(xml);
      });
    } else {
      res.redirect(person.photosurl);
    }
  });
});

app.get('/favorites/:userid.:format?', function(req, res) {
  flickr.people.getInfo(req.params.userid, function(e, person) {
    if(req.params.format == 'atom') {
      favorites(person, function(xml) {
        res.send(xml);
      });
    } else {
      var favoritesUrl = person.photosurl.replace('/photos', '/favorites');
      res.redirect(favoritesUrl);
    }
  });
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
