# Flickr Originals

I wrote this nodejs app so that I could have a feed of my Flickr images
in their original (i.e. large) size. I also wanted my favorites feed
with large images.

I use [IFTTT][3] to download my photos and my favorites from these feeds
to my Dropbox, then use them as my desktop wallpapers (rotating).

# Usage

If you're hosting at Heroku, add all of the config values:

    heroku config:add KEY=VALUE

Add the following config values:

  * FLICKR\_API\_KEY
  * FLICKR\_USER\_ID
  * SERVER\_ROOT

Or, if you're hosting elsewhere, or just want to test locally, add these
config settings to a local config.js file (see config.example.js).

## Using My Host

Or, you can just use my host. (though I may not always keep this app up
and running)

1. [Find your Flickr Id][4]
2. Navigate to:
    - http://flickr.donnierayjones.com/favorites/{your-id}.atom
    - http://flickr.donnierayjones.com/photos/{your-id}.atom

# Demo

  * [View My Favorites Feed][1]
  * [View My Photos Feed][2]

[1]: http://flickr.donnierayjones.com/favorites/11946169@N00.atom
[2]: http://flickr.donnierayjones.com/photos/11946169@N00.atom
[3]: https://ifttt.com
[4]: http://idgettr.com/
