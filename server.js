var app = express();
app.use(express.cookieParser());  
app.use(express.bodyParser());  
app.use(express.methodOverride());  
app.use(express.session({ secret: "secret" }));  

var port = process.env.PORT || 8080;

var io = require('socket.io').listen(app.listen(port)); // this tells socket.io to use our express server

app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');//Ana Dizine yönlendir
});
app.get('/b', function(req, res) {
   res.sendfile(__dirname + '/b.html');//Ana Dizine yönlendir
   
});

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
