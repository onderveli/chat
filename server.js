var express = require('express'),
	app = express();
var nicknames = [];//kullanıcı listesi
var color=[];
var	writes=[];//yazıyor listesi
var port = process.env.PORT || 8080;

var io = require('socket.io').listen(app.listen(port)); // this tells socket.io to use our express server

app.use(express.bodyParser({uploadDir:'./uploads'}));

app.post('/file-upload', function(req, res, next) {
    console.log(req.body);
    console.log(req.files);
});
var fs = require('fs');
app.post('/file-upload', function(req, res) {
    // get the temporary location of the file
    var tmp_path = req.files.thumbnail.path;
    // set where the file should actually exists - in this case it is in the "images" directory
    var target_path = './img/' + req.files.thumbnail.name;
    // move the file from the temporary location to the intended location
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
            if (err) throw err;
            res.send('File uploaded to: ' + target_path + ' - ' + req.files.thumbnail.size + ' bytes');
        });
    });
});
app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');//Ana Dizine yönlendir
});

io.sockets.on('connection', function(socket){//Socket ile bağlantı kuruldu.

	socket.on('new user', function(data, callback){
		if (nicknames.indexOf(data) != -1){
			callback(false);
		} else{
			callback(true);
			socket.nickname = data;
			nicknames.push(socket.nickname);
			color.push("#09F");
			updateNicknames();
		}
	});
	
	function updateNicknames(){
		for(i=0; i <= nicknames.length ;i++)
		{
			var tweet = {color: color[i], nick: nicknames[i]};
			io.sockets.emit('usernames', tweet);
		}
	} 
	function isGone()
	{
		io.sockets.emit('isGone', nicknames);
	}
	function deleteNick(nickname)
	{
		writes.splice(writes.indexOf(nickname), 1);
		io.sockets.emit('deleteNick', writes);
	}
	socket.on('send message', function(data){//Socket açtık ve içine data değerini aldık
		io.sockets.emit('new message', {msg: data, nick: socket.nickname});//Data'yı socket üzerinden istemcilerdeki fonksiyona yolladık
		deleteNick(socket.nickname);
	});
	socket.on('write', function(data){//Socket açtık ve içine data değerini aldık
		if(writes.indexOf(socket.nickname) == -1)
		{		
			writes.push(socket.nickname);
			io.sockets.emit('writes',writes);//Data'yı socket üzerinden istemcilerdeki fonksiyona yolladık
		}
		else if(data.trim()=="" || data.trim()==null ||data=="" || data==null)
		{
			deleteNick(socket.nickname);
		}
	});
	socket.on('colorChange2',function(data)
	{
		var index = nicknames.indexOf(socket.nickname);
		
		color[index] = "#999";
		console.log(color)
		updateNicknames();
		
	});
		socket.on('colorChange',function(data)
	{
		var index = nicknames.indexOf(socket.nickname);
		color[index] = "#09F";
		updateNicknames();
		
	});
	socket.on('disconnect', function(data){
		isGone();
		var index = nicknames.indexOf(socket.nickname);
		color.splice(color[index], 1);
		if(!socket.nickname) return;
		nicknames.splice(nicknames.indexOf(socket.nickname), 1);
		updateNicknames();
		
	});
});







