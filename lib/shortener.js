var request = require('request');
var _ = require('underscore');

var shortener = function(config) {
  config = config || {};

  var self = {
    prefix: 'https://goo.gl/',
    prefixRegex: /^https?:\/\/goo.gl\//
  };

  var shortenerRequest = function(options, callback) {
    options.url = 'https://www.googleapis.com/urlshortener/v1/url';
    options.gzip = true;

    options.qs = options.qs || {};

    if (config.apiKey) {
      options.qs.key = config.apiKey;
    }

    request(options, function(err, response, body) {
      if (err) {
        console.error(err);
        return callback({
          code: 500,
          message: 'Google Shortener request failed: ' + err
        });
      }

      if (response.statusCode !== 200) {
        console.error('Google Shortener request failed with status ' + response.statusCode);
        return callback({
          code: response.statusCode,
          message: 'Google Shortener response failure'
        });
      }

      if (!body) {
        console.error('Google Shortener response body is missing');
        return callback({
          code: 500,
          message: 'Google Shortener response body is missing'
        });
      }

      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (exc) {
          console.error('JSON parsing of Google Shortener response body failed: ' + exc);
          return callback({
            code: 500,
            message: 'Response body could not be parsed'
          });
        }
      }

      // Shortener responses always have the shortened id AND the long url
      if (!body.id || !body.longUrl) {
        console.error('Google Shortener sresponse is malformed');
        return callback({
          code: 500,
          message: 'Google Shortener response is malformed'
        });
      }

      callback(null, body);
    });
  };

  self.getShortCode = function(shortUrl) {
    return shortUrl.replace(self.prefixRegex, '');
  };

  self.filterLongUrl = function(longUrl) {
    if (config.restrict) {
      // String: split into tokens
      if (typeof config.restrict === 'string' && config.restrict.trim().length > 0) {
        config.restrict = config.restrict.split(/\s+/);
      }

      if (Array.isArray(config.restrict)) {
        var matches = false;
        config.restrict.forEach(function(restrict) {
          matches = matches || longUrl.indexOf(restrict) === 0;
        });

        if (!matches) {
          return null;
        }
      }

      // Regular Expression
      if (config.restrict instanceof RegExp && !config.restrict.test(longUrl)) {
        return null;
      }
    }

    return longUrl;
  };

  self.shorten = function(longUrl, callback) {
    longUrl = self.filterLongUrl(longUrl);

    if (!longUrl) {
      return callback({
        code: 400,
        message: 'Invalid URL to be shortened'
      });
    }

    shortenerRequest({
      method: 'POST',
      json: {
        longUrl: longUrl
      }
    }, function(err, body) {
      callback(err, body && body.id);
    });
  };

  self.expand = function(shortUrl, callback) {
    shortenerRequest({
      method: 'GET',
      qs: {
        shortUrl: shortUrl
      }
    }, function(err, body) {
      callback(err, body && body.longUrl);
    });
  };

  return self;
};

// Export the shortener factory "decorated" with a default shortener. I love javascript.
module.exports = _.extend(shortener, shortener());
