module.exports = function(callback) {
  var events = require('events');
  var _ = require('underscore');
  var FlickrAPI = require('flickrnode').FlickrAPI;
  var ATOM = require('atom');
  var config = require('./config_provider');

  var emitter = new events.EventEmitter();

  var flickr = new FlickrAPI(config.get('FLICKR_API_KEY'));

  var feed = new ATOM({
    title: "Flickr Photos",
    id: 'tag:donnierayjones.com,2012:http://www.flickr.com/photos/donnieray',
    description: "My Flickr Photos in their original image sizes",
    feed_url: 'http://flickr.donnierayjones.com/photos.atom',
    site_url: 'http://flickr.com/photos/donnieray',
    author: 'Donnie Ray Jones',
  });

  emitter.on('feed-ready', function() {
    feed.items = _.sortBy(feed.items, 'date').reverse();
    callback(feed.xml('  '));
  });

  flickr.people.getPublicPhotos(config.get('FLICKR_USER_ID'), function(e, results) {
    var count = results.photo.length;
    _.each(results.photo, function(photo_info) {
      flickr.photos.getInfo(photo_info.id, photo_info.secret, function(e, photo_detail) {
        if(photo_detail.originalsecret !== undefined)
        {
          var original_url = 'http://farm' + photo_info.farm + '.staticflickr.com/' + photo_info.server + '/' + photo_info.id + '_' + photo_detail.originalsecret + '_o.' + photo_detail.originalformat;
          var medium_url = 'http://farm' + photo_info.farm + '.staticflickr.com/' + photo_info.server + '/' + photo_info.id + '_' + photo_detail.secret + '_z.jpg';
          var flickr_url = 'http://www.flickr.com/photos/' + photo_detail.owner.nsid + '/' + photo_detail.id;
          feed.item({
            id: original_url,
            title: photo_info.title,
            author: [{
              name: photo_detail.owner.realname
            }],
            content: [{
              _attr: {
                type: 'html'
              }},
              '<p>' + photo_info.title + ' by ' + photo_detail.owner.username + '</p>' +
              '<p><a href="' + flickr_url + '"><img src="' + original_url + '" /></p>'
            ],
            date: new Date(photo_detail.dates.posted * 1000),
            updated: new Date(photo_detail.dates.lastupdate * 1000),
            link: {
              _attr: {
                rel: 'enclosure',
                type: 'image/jpeg',
                href: original_url
              }
            },
            alternate: {
              _attr: {
                rel: 'alternate',
                type: 'text/html',
                href: flickr_url
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
