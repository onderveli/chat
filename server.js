var express = require('express'),
	app = express();
var bodyParser = require('body-parser'); //connects bodyParsing middleware
var formidable = require('formidable');
var path = require('path');     //used for file path
var fs =require('fs-extra');    //File System-needed for renaming file etc
var nicknames = [];//kullanıcı listesi
var color=[];
var	writes=[];//yazıyor listesi
var port = process.env.PORT || 8080;

var io = require('socket.io').listen(app.listen(port)); // this tells socket.io to use our express server

app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');//Ana Dizine yönlendir
});
app.use(bodyParser({defer: true}));
 app.route('/upload')
 .post(function (req, res, next) {

  var form = new formidable.IncomingForm();
    //Formidable uploads to operating systems tmp dir by default
    form.uploadDir = "./img";       //set upload directory
    form.keepExtensions = true;     //keep file extension

    form.parse(req, function(err, fields, files) {
        res.writeHead(200, {'content-type': 'text/plain'});
        res.write('received upload:\n\n');
        console.log("form.bytesReceived");
        //TESTING
        console.log("file size: "+JSON.stringify(files.fileUploaded.size));
        console.log("file path: "+JSON.stringify(files.fileUploaded.path));
        console.log("file name: "+JSON.stringify(files.fileUploaded.name));
        console.log("file type: "+JSON.stringify(files.fileUploaded.type));
        console.log("astModifiedDate: "+JSON.stringify(files.fileUploaded.lastModifiedDate));

        //Formidable changes the name of the uploaded file
        //Rename the file to its original name
        fs.rename(files.fileUploaded.path, 'img/'+files.fileUploaded.name, function(err) {
        if (err)
            throw err;
          console.log('renamed complete');  
        });
          res.end();
    });
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







