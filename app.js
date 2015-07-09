var express = require('express'), app = module.exports = express(), bodyParser = require('body-parser'), morgan = require('morgan'), methodOverride = require('method-override'), cookieParser = require('cookie-parser'), session = require('express-session'), sanmoku = require('./routes/sanmoku'), login = require('./routes/login'), room = require('./routes/room'), path = require('path');

var server = require('http').Server(app), io = require('socket.io')(server);

var user = [];

// middleware
app.use(morgan({
	format : 'dev',
	immediate : true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended : true
}));
app.use(session({
	secret : 'secret',
	resave : false,
	saveUninitialized : false
}));
app.use(methodOverride());

// listen server
server.listen(3000);
console.log("server starting...");

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// ログイン画面
app.get('/', login.index);

// room画面
app.post('/room', room.index);

// 三目並べ画面
app.get('/game', sanmoku.index);

// ○ or ×
app.post('/pick', sanmoku.pick);

// socket connect
io.sockets.on('connection', function(socket) {

	// 接続時
	socket.on('connected', function(data) {
		var msg = data + " さんが入室しました";
		user.push(data);
		io.sockets.emit("publish", {
			value : msg
		});
	});

	// メッセージ送信
	socket.on('publish', function(data) {
		io.sockets.emit("publish", {
			value : data.value
		});
	});

	// 画面データの共有
	socket.on('screenShare', function(data) {
		io.sockets.emit("screenGet", data);
	});

	// 勝負結果の共有
	socket.on('resultShare', function(data) {
		io.sockets.emit("result", data);
	});

	// 接続解除
	socket.on('disconnect', function(data) {
		// var msg = data + " さんが退出しました";
		// io.sockets.emit("publish",{value: msg})
	});

});
