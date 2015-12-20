module.exports = function(min_width, callback) {
  var events = require('events');
  var _ = require('underscore');
  var Flickr = require('flickrapi');
  var ATOM = require('atom');
  var config = require('./config_provider');

  var emitter = new events.EventEmitter();

  min_width = min_width || 1920;

  var flickrOptions = {
    api_key: config.get('FLICKR_API_KEY'),
    secret: config.get('FLICKR_API_SECRET')
  };

  Flickr.tokenOnly(flickrOptions, function(error, flickr) {
    flickr.interestingness.getList({ perpage: 500, extras: ['url_o', 'url_z', 'date_upload', 'last_update'] }, function(e, result) {
      var count = result.photos.photo.length;
      _.each(result.photos.photo, function(photo_info) {
        console.log(photo_info.date_upload);
        console.log(photo_info.last_update);
        if(photo_info.url_o) {
          if(photo_info.width_o > min_width && (parseFloat(photo_info.width_o) / parseFloat(photo_info.height_o) >= 1.2)) {
            feed.item({
              id: photo_info.id,
              title: photo_info.title,
              content: [{
                _attr: {
                  type: 'html'
                }},
                '<p>' + photo_info.title + '</p>' +
                '<p><a href="' + photo_info.url_o + '"><img src="' + photo_info.url_z + '" /></p>'
              ],
              date: new Date(photo_info.dateupload * 1000),
              updated: new Date(photo_info.lastupdate * 1000),
              link: {
                _attr: {
                  rel: 'enclosure',
                  type: 'image/jpeg',
                  href: photo_info.url_o
                }
              },
              alternate: {
                _attr: {
                  rel: 'alternate',
                  type: 'text/html',
                  href: photo_info.url_o
                }
              }
            });
          }
        }
        count--;
        if(count === 0) {
          emitter.emit('feed-ready');
        }
      });
    });
  });

  var feedUrl = config.get('SERVER_ROOT') + '/explore.atom';

  var feed = new ATOM({
    title: "Flickr Explore",
    id: "tag: Flickr Explore",
    description: "Flickr Favorites in their original image sizes",
    feed_url: feedUrl,
    site_url: "https://www.flickr.com/explore",
    author: "Flickr"
  });

  emitter.on('feed-ready', function() {
    feed.items = _.sortBy(feed.items, 'date').reverse();
    callback(feed.xml('  '));
  });
};
