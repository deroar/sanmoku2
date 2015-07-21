var express = require('express'),
	app = module.exports = express(),
	bodyParser = require('body-parser'),
	morgan = require('morgan'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	mongoStore = require('connect-mongo')(session);

var sanmoku = require('./routes/sanmoku'),
	login = require('./routes/login'),
	room = require('./routes/room'),
	path = require('path'),
	routes = require('./routes/index');

var server = require('http').Server(app), io = require('socket.io')(server);

var user = {};

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
	store : new mongoStore({
		db : 'session',
		host : 'localhost',
		clear_interval : 60 * 60
	}),
	cookie : {
		httpOnly : false,
		maxAge : new Date(Date.now() + 60 * 60 * 1000)
	}
}));

// listen server
server.listen(7000);
console.log("server starting...");

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

var loginCheck = function(req, res, next) {

	if (req.session.user) {
		next();
	} else {
		res.redirect('/login');
	}
};

// ログイン画面

app.set('view engine', 'ejs');

app.get('/', loginCheck, routes.index);

app.get('/login', routes.login);

app.post('/add', routes.add);

app.get('/logout', function(req, res) {
	req.session.destroy();
	console.log('deleted session');
	res.redirect('/');
});

/*
 * app.get('/', login.index);
 */
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
		console.log("socket.io >> " + socket.id);
		var msg = data + " さんが入室しました";
		//user.push(data);
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
		console.log("screenShare -start-");
		io.sockets.emit("screenGet", {btnId:data.btnId, koma:data.koma});
	});
	// ゲーム情報の共有
	socket.on('gameShare', function(data) {
		console.log("gameShare -start-");
		console.log("data >> " + data.player)
		io.sockets.emit("turnShare", data.player);
	});


	// 勝負結果の共有
	socket.on('resultShare', function(data) {
		io.sockets.emit("result", data);
	});

	//game画面接続時「
	socket.on('connectStart', function(data) {
		console.log("socket.id >> " + socket.id);

		user[socket.id] = data;

//		user.push(data);
		/*
		for(var key in user){
			console.log(user[key]);
		};
*/
		var username = Object.values(user);
		console.log("socket.count >> " + username.length);

		io.sockets.emit("sktCnt", username);
	});

	// 接続解除
	socket.on('disconnect', function(data) {
		console.log("disconnect--start--");
		console.log("delete player >> " + data);
		delete user[socket.id];
		console.log("socketCnt >> " + user.length);
//		console.log("socket.count >> " + user.length);
		// var msg = data + " さんが退出しました";
		// io.sockets.emit("publish",{value: msg})
	});

});
//オブジェクトから値を取り出し、配列に格納する
if (!Object.values) {
	Object.values = function (obj) {
    var a = [], i = 0, p;
    for (p in obj) if (obj.hasOwnProperty(p)) {
      a[i++] = obj[p];
    }
    return a;
	};
}
