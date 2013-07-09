var fs = require('fs');
var express = require('express');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  response.send(fs.readFileSync("index.html").toString());
  console.log("Listening on " + port);
});
