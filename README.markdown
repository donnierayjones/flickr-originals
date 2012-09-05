# Flickr Images

I wrote this nodejs app so that I could have a feed of my Flickr images
in their original (i.e. large) size. I also wanted my favorites feed
with large images.

I use this to download my photos and my favorites, then use them as my
desktop wallpapers (rotating).

# Usage

If you're hosting at heroku, add all of the config values:

    heroku config:add KEY=VALUE

Add the following config values:

  * FLICKR\_API\_KEY
  * FLICKR\_USER\_ID
  * FLICKR\_USERNAME

Or, if you're hosting elsewhere, or just want to test locally, add these
config settings to a local config.js file (see config.example.js).
