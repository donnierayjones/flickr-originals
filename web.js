var express = require('express');
var morgan = require('morgan');
var favorites = require('./favorites-atom');
var photos = require('./photos-atom');
var explore = require('./explore-atom');
var config = require('./config_provider');
var FlickrAPI = require('flickrnode').FlickrAPI;

var app = express();
app.use(morgan());
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
      var favoritesUrl = person.photosurl + 'favorites';
      res.redirect(favoritesUrl);
    }
  });
});

app.get('/explore/:min_width?', function(req, res) {
  explore(req.params.min_width, function(xml) {
    res.send(xml);
  });
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
