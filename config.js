module.exports = {
  // Your server host, to make it fix instead of getting it from headers
  host: process.env.HOST,

  // Your Google API key, if you want to use one.
  apiKey: process.env.API_KEY,

  // Restrict URLs that can be shortened by the service.
  // Can be a string, in which case URL to shorten must start with this string,
  // or it can be a regular expression object. I love javascript.
  restrict: process.env.RESTRICT
};
