module.exports = function(options, callback) {
  var Flickr = require('flickrapi');
  var Feed = require('feed');
  var config = require('./config_provider');

  var person = options.person;
  var min_width = options.min_width || 1920;

  var flickrOptions = {
    api_key: config.get('FLICKR_API_KEY'),
    secret: config.get('FLICKR_API_SECRET')
  };

  var username = person.username;
  var userId = person.nsid;
  var feedUrl = config.get('SERVER_ROOT') + '/favorites/' + userId + '.atom';
  var favoritesUrl = person.photosurl + 'favorites';

  var feed = new Feed({
    title: "Flickr Favorites",
    id: 'tag:' + person.username + ' Original Favorites,' + favoritesUrl,
    link: options.link,
    description: "Flickr Favorites in their original image sizes",
    author: username
  });

  Flickr.tokenOnly(flickrOptions, function(error, flickr) {
    flickr.favorites.getPublicList({ user_id: userId, per_page: 500, extras: ['url_o', 'url_z', 'date_upload', 'last_update'] }, function(e, result) {
      result.photos.photo.forEach(function(photo_info) {
        if(photo_info.url_o) {
          var width_o = parseInt(photo_info.width_o, 10);
          var height_o = parseInt(photo_info.height_o, 10);
          var widthHeightRatio = parseFloat(width_o) / parseFloat(height_o);
          if(width_o > min_width && widthHeightRatio >= 1.2 && widthHeightRatio <= 2.0) {
            {
              feed.addItem({
                id: photo_info.id,
                title: photo_info.title || 'Untitled',
                link: photo_info.url_o,
                content: '<p>' + photo_info.title + '</p>' +
                    '<p><a href="' + photo_info.url_o + '"><img src="' + photo_info.url_o + '" /></p>',
                date: new Date(photo_info.date_faved * 1000),
                updated: new Date(photo_info.lastupdate * 1000),
              });
            }
          }
        }
      });
      callback(feed.render('rss-2.0'));
    });
  });
};
