var app = express();
app.use(express.cookieParser());  
app.use(express.bodyParser());  
app.use(express.methodOverride());  
app.use(express.session({ secret: "secret" }));  
app.use(express.static(process.env.OPENSHIFT_REPO_DIR + '/' ));  

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000;
var ipaddress   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var server=app.listen(port, ipaddress);

var io = require('socket.io').listen(server); // this tells socket.io to use our express server

app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');//Ana Dizine yönlendir
});
app.get('/b', function(req, res) {
   res.sendfile(__dirname + '/b.html');//Ana Dizine yönlendir
   
});
/*
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
**/