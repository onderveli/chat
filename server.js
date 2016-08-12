var express = require('express'),
	app = express();

var nicknames = [];//kullanıcı listesi
var color=[];
var	writes=[];//yazıyor listesi
var port = process.env.PORT || 8080;

var io = require('socket.io').listen(app.listen(port)); // this tells socket.io to use our express server
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'yazilimciakli.com',
  user     : 'chatv23',
  password : '123456',
  database : 'ChatAppV1'
});

connection.connect();




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
		var a=0;
		for(i=0; i <= nicknames.length ;i++)
		{
			if(i==nicknames.length)
			{
				a=1;
				console.log(a);
				io.sockets.emit('usernames', a);
			}
			else
			{
				var tweet = {color: color[i], nick: nicknames[i]};
				io.sockets.emit('usernames', tweet);
			}
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

		connection.query('INSERT INTO logs (name,msg) VALUES ("'+socket.nickname+'","'+data+'")', function(err, rows, fields) {
		  if (!err)
			console.log('The solution is: ', rows);
		  else
			console.log('Error while performing Query.');
		});

	
		deleteNick(socket.nickname);
		updateNicknames();
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
		connection.end();
	});
});







