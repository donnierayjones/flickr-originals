module.exports = function(callback) {
  var events = require('events');
  var _ = require('underscore');
  var FlickrAPI = require('flickrnode').FlickrAPI;
  var ATOM = require('atom');
  var config = require('./config_provider');

  var emitter = new events.EventEmitter();

  var flickr = new FlickrAPI(config.get('FLICKR_API_KEY'));

  var feed = new ATOM({
    title: "Flickr Favorites",
    id: 'tag:donnierayjones.com,2012:http://www.flickr.com/photos/donnieray/favorites',
    description: "My Flickr Favorites in their original image sizes",
    feed_url: 'http://flickr.donnierayjones.com/favorites.atom',
    site_url: 'http://flickr.com/donnieray/favorites',
    author: 'Donnie Ray Jones',
  });

  emitter.on('feed-ready', function() {
    feed.items = _.sortBy(feed.items, 'date').reverse();
    callback(feed.xml('  '));
  });

  flickr.favorites.getPublicList(config.get('FLICKR_USER_ID'), function(e, results) {
    var count = results.photo.length;
    _.each(results.photo, function(photo_info) {
      flickr.photos.getSizes(photo_info.id, function(e, photo_sizes) {
        var largest_size = _.max(photo_sizes.size, function(s) {
          return parseInt(s.width, 10);
        });
        if(parseInt(largest_size.width) > 1920)
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
              '<p><a href="' + largest_size.url + '"><img src="' + medium_url.source + '" /></p>'
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
