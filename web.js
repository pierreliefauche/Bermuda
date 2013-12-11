var app = require('./app');

var server = app.listen(process.env.PORT || 4000);

process.on('SIGTERM', function() {
  console.log('Shutting down server...');

  server.close(function() {
    console.log('Connections closed...');
    process.exit();
  });
});
