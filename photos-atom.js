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
  var feedUrl = config.get('SERVER_ROOT') + '/photos/' + userId + '.atom';

  var feed = new ATOM({
    title: "Flickr Photos",
    id: 'tag:' + person.username + ' Original Photos,' + person.photosurl,
    description: "Flickr Photos in their original image sizes",
    feed_url: feedUrl,
    site_url: person.photosurl,
    author: username
  });

  emitter.on('feed-ready', function() {
    feed.items = _.sortBy(feed.items, 'date').reverse();
    callback(feed.xml('  '));
  });

  flickr.people.getPublicPhotos(userId, function(e, results) {
    var count = results.photo.length;
    if(count === 0) {
      emitter.emit('feed-ready');
    }
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
