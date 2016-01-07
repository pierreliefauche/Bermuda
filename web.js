var app = require('./app');

var port = process.env.PORT || 4000;
var server = app.listen(port, function() {
  console.log('Bermuda listening on port', port);
});

process.on('SIGTERM', function() {
  console.log('Shutting down server...');

  server.close(function() {
    console.log('Connections closed...');
    process.exit();
  });
});
