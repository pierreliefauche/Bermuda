'use strict'; /* jshint unused: false */

var express = require('express');
var bodyParser = require('body-parser');
var hpp = require('hpp');
var helmet = require('helmet');
var compression = require('compression');
var cors = require('cors');

// Configuration
var config = require('./config');

// Library
var shortener = require('./lib/shortener')(config);

// Initialize web server
var app = express();

app.set('case sensitive routing', false);
app.set('etag', false);
app.set('query parser', 'simple');
app.set('strict routing', false);
app.set('trust proxy', true);
app.set('x-powered-by', false);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(hpp());
app.use(helmet());
app.use(compression());
app.use(cors());


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

    var code = shortener.getShortCode(shortUrl);

    // Build final short URL
    var customShortUrl = req.protocol + '://' + (config.host || req.get('host')) + '/' + code;

    res.format({
      default: function(){
        res.send(customShortUrl);
      },
      json: function(){
        res.send({ shortUrl: customShortUrl });
      }
    });
  });
};


// Shorten URL
app.all('/', function(req, res, next) {
  req.params.longUrl = req.param('longUrl');
  shortenUrl(req, res, next);
});

// Expand URL (or shorten, whatever)
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
  res.status(err.code || 500).send(err.message);
});

module.exports = app;
