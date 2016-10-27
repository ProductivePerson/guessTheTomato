//app.js
var express = require('express');

app = express();

app.use('/modules', express.static(__dirname + '/node_modules/'));
app.use('/public', express.static(__dirname + '/public/'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

console.log('App is listening on', process.env.PORT || "3000");
app.listen(process.env.PORT || 3000);
