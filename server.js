var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/index.html'));

// views is directory for all template files
app.set('b', __dirname + '/b.html');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('index.html');
});

app.listen(app.get('port'), function() {
      socket.on('solOk', function (data) {
		console.log('SolOk');
        io.sockets.emit('SolOk', data);
    });
	socket.on('sagOk', function (data) {
		console.log('SagOk');
        io.sockets.emit('SagOk', data);
    });
});




