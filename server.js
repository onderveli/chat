var express = require('express');
var app = express();

var nicknames = [];//kullanıcı listesi
var	writes=[];//yazıyor listesi
var port = process.env.PORT || 8080;

var io = require('socket.io').listen(app.listen(port)); // this tells socket.io to use our express server


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
			nicknames[socket.nickname][0]="#09F";
			updateNicknames();
		}
	});
	
	function updateNicknames(){
		io.sockets.emit('temizle',{msg: 0});
		var tweet;
		for(i=0; i < nicknames.length ;i++)
		{
			tweet= {color: nicknames[i][0], nick: nicknames[i]}
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
		nicknames[socket.nickname][0] = "#999";
		updateNicknames();
		
	});
		socket.on('colorChange',function(data)
	{
		nicknames[socket.nickname][0] = "#09F";
		updateNicknames();
		
	});
	socket.on('disconnect', function(data){
		isGone();
		if(!socket.nickname) return;
		nicknames.splice(nicknames.indexOf(socket.nickname), 1);
		updateNicknames();
	});
});







