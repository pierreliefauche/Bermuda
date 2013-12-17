/* jshint unused: false */

var https = require('https');
https.globalAgent.maxSockets = 250;

var express = require('express');
var app = module.exports = express();

// Express Middleware
app.use(express.bodyParser());
app.use(express.compress());


// Retrieve configuration
var config = require('./config');

// Library
var shortener = require('./lib/shortener')(config);


// Shorten URL
var shortenUrl = function(req, res, next) {
  if (!req.params.longUrl) {
    return next({
      code: 400,
      message: 'longUrl parameter is required'
    });
  }

  shortener.shorten(req.params.longUrl, function(err, shortUrl) {
    if (err) {
      return next(err);
    }

    var code = shortUrl.substr(shortener.prefix.length);

    // Build final short URL
    var customShortUrl = req.protocol + '://' + req.get('host') + '/' + code;

    res.send(200, customShortUrl);
  });
};


// Shorten URL
app.all('/', function(req, res, next) {
  req.params.longUrl = req.param('longUrl');
  shortenUrl(req, res, next);
});

// Expand URL (of shorten, whatever)
app.all('/:code', function(req, res, next) {
  // If the code begins with 'http', it’s a URL, so shorten it.
  if (req.params.code.indexOf('http') === 0) {
    req.params.longUrl = req.params.code;
    return shortenUrl(req, res, next);
  }

  // Expand short code and redirect
  var shortUrl = shortener.prefix + req.params.code;

  shortener.expand(shortUrl, function(err, longUrl) {
    if (err) {
      return next(err);
    }

    res.redirect(longUrl);
  });
});


// Error handling
app.use(function(err, req, res, next){
  console.error(err);
  res.send(err.code || 500, err.message);
});
