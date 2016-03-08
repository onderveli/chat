var cool = require('cool-ascii-faces');
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 8080));


app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');//Ana Dizine yönlendir
});

app.get('/b', function(req, res) {
   res.sendfile(__dirname + '/b.html');//Ana Dizine yönlendir
});

var serverim = app.listen(port, ipaddress, function () {
  console.log('Example app listening on port 3000!');
});

var io = require('socket.io').listen(serverim);

io.sockets.on('connection', function (socket) {
    socket.on('solOk', function (data) {
		console.log('SolOk');
        io.sockets.emit('SolOk', data);
    });
	socket.on('sagOk', function (data) {
		console.log('SagOk');
        io.sockets.emit('SagOk', data);
    });
});

