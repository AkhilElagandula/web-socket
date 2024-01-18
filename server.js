const express = require('express');
const path = require('path');
const app = express();
var setup = {
  mode: 'local',
  port: 4200,
  sslFlag: false,
}

var config = {
  local: {
    mode: 'local',
    port: 4200,
    sslFlag: false,
  },
  staging: {
    mode: 'staging',
    port: 4200,
    sslFlag: true,

  },
  production: {
    mode: 'production',
    port: 5200,
    sslFlag: true,

  }
}

var a = process.argv[2];
if (a) {
  setup = config[a];
} else {
  setup = config.local;
}


app.set('port', (process.env.PORT || setup.port || 4200));

app.use('/', express.static(__dirname + '/dist',
  {
    etag: true, // Just being explicit about the default.
    lastModified: true,  // Just being explicit about the default.
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        // All of the project's HTML files end in .html
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  }
)
);

app.get('*', function (request, response) {
  let timestamp = new Date().getTime();
  response.sendFile(path.resolve(__dirname, 'dist/index.html',
  ));
});

if (setup.sslFlag) {
  var https_options = {

    key: fs.readFileSync("../websocket/ssl/religare.key"),

    cert: fs.readFileSync("../websocket/ssl/Certificate.cer"),

  }
  https.createServer(https_options, app).listen(app.get('port'), function () {
    console.log('Religare Api listening on port ' + app.get('port') + " with " + setup.mode + " configuration.");

  })
} else {

  // Start the app by listening on the default port
  app.listen(app.get('port'), function () {
    console.log('Angular Starter App listening on port ' + app.get('port') + " with " + setup.mode + " configuration.");
  });
}
