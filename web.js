var express = require('express');
var morgan = require('morgan');
var favorites = require('./favorites-atom');
var photos = require('./photos-atom');
var explore = require('./explore-atom');
var config = require('./config_provider');
var Flickr = require('flickrapi');

var flickrOptions = {
  api_key: config.get('FLICKR_API_KEY'),
  secret: config.get('FLICKR_API_SECRET')
};

var app = express();
app.use(morgan());

var getUrl = function(req) {
  return req.protocol + '://' + req.get('host') + req.originalUrl;
};

app.get('/', function(req, res) {
  res.send("flickr originals!");
});

app.get('/photos/:userid.:format?', function(req, res) {
  Flickr.tokenOnly(flickrOptions, function(error, flickr) {
    flickr.people.getInfo({ user_id: req.params.userid }, function(e, result) {
      console.log('e', e);
      console.log('result', result);
      if(req.params.format == 'atom') {
        var options = {
          link: getUrl(req),
          min_width: req.query.min_width,
          person: result.person
        };
        photos(options, function(xml) {
          res.send(xml);
        });
      } else {
        res.redirect(result.person.photosurl);
      }
    });
  });
});

app.get('/favorites/:userid.:format?', function(req, res) {
  Flickr.tokenOnly(flickrOptions, function(error, flickr) {
    flickr.people.getInfo({ user_id: req.params.userid }, function(e, result) {
      if(req.params.format == 'atom') {
        var options = {
          link: getUrl(req),
          min_width: req.query.min_width,
          person: result.person
        };
        favorites(options, function(xml) {
          res.send(xml);
        });
      } else {
        var favoritesUrl = result.person.photosurl + 'favorites';
        res.redirect(favoritesUrl);
      }
    });
  });
});

app.get('/explore', function(req, res) {
  var options = {
    link: getUrl(req),
    min_width: req.query.min_width
  };
  explore(options, function(xml) {
    res.send(xml);
  });
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
