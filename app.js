var express = require('express'),
	app = express(),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    methodOverride = require('method-override'),
    sanmoku = require('./routes/sanmoku'),
    login = require('./routes/login'),
    room = require('./routes/room');

var server = require('http').Server(app),
	io = require('socket.io')(server);

//middleware
app.use(morgan({format: 'dev', immediate: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride());

server.listen(3000);
console.log("server starting...");

app.set('views',__dirname + '/views');
app.set('view engine','ejs');



//ログイン画面
app.get('/',login.index);

//room画面
app.post('/room',room.index);

//三目並べ画面
app.get('/game',sanmoku.index);

//○　or　×
app.post('/pick',sanmoku.pick);

//三目並べ初期化
app.post('/init',sanmoku.init);

//socket connect
io.sockets.on('connection',function(socket){

	//接続時

	socket.on('connected',function(data){
		var msg = data + " さんが入室しました";
		io.sockets.emit("publish",{value: msg})
	});

	//メッセージ送信
	socket.on('publish', function (data) {
		io.sockets.emit("publish", {value:data.value});
	});

	//画面データの共有
	socket.on('screenShare', function () {
		io.sockets.emit("screenGet");
	});


	//接続解除
	socket.on('disconnect', function (data) {
		//var msg = data + " さんが退出しました";
		//io.sockets.emit("publish",{value: msg})
	});

});
