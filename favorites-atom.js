module.exports = function(person, callback) {
  var events = require('events');
  var _ = require('underscore');
  var FlickrAPI = require('flickrnode').FlickrAPI;
  var ATOM = require('atom');
  var config = require('./config_provider');

  var emitter = new events.EventEmitter();

  var flickr = new FlickrAPI(config.get('FLICKR_API_KEY'));

  var username = person.username;
  var userId = person.nsid;
  var feedUrl = config.get('SERVER_ROOT') + '/favorites/' + userId + '.atom';
  var favoritesUrl = person.photosurl.replace('/photos', '/favorites');

  var feed = new ATOM({
    title: "Flickr Favorites",
    id: 'tag:' + person.username + ' Original Favorites,' + favoritesUrl,
    description: "Flickr Favorites in their original image sizes",
    feed_url: feedUrl,
    site_url: favoritesUrl,
    author: username
  });

  emitter.on('feed-ready', function() {
    feed.items = _.sortBy(feed.items, 'date').reverse();
    callback(feed.xml('  '));
  });

  flickr.favorites.getPublicList(userId, function(e, results) {
    var count = results.photo.length;
    _.each(results.photo, function(photo_info) {
      flickr.photos.getSizes(photo_info.id, function(e, photo_sizes) {
        var largest_size = _.max(photo_sizes.size, function(s) {
          return parseInt(s.width, 10);
        });
        if(parseInt(largest_size.width, 10) > 1920)
        {
          var medium_url = _.find(photo_sizes.size, function(s) {
            return s.label === 'Medium';
          });
          feed.item({
            id: largest_size.source,
            title: photo_info.title,
            content: [{
              _attr: {
                type: 'html'
              }},
              '<p>' + photo_info.title + '</p>' +
              '<p><a href="' + largest_size.url + '"><img src="' + largest_size.source + '" /></p>'
            ],
            date: new Date(photo_info.date_faved * 1000),
            updated: new Date(photo_info.date_faved * 1000),
            link: {
              _attr: {
                rel: 'enclosure',
                type: 'image/jpeg',
                href: largest_size.source
              }
            },
            alternate: {
              _attr: {
                rel: 'alternate',
                type: 'text/html',
                href: largest_size.url
              }
            }
          });
        }
        count--;
        if(count === 0) {
          emitter.emit('feed-ready');
        }
      });
    });
  });
};
