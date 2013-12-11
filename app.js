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
app.post('/:longUrl', function(req, res, next) {
  shortener.shorten(req.params.longUrl, function(err, shortUrl) {
    if (err) {
      return next(err);
    }

    var code = shortUrl.substr(shortener.prefix.length);

    // Build final short URL
    var customShortUrl = req.protocol + '://' + req.get('host') + '/' + code;

    res.send(200, customShortUrl);
  });
});

// Expand URL
app.get('/:code', function(req, res, next) {
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
