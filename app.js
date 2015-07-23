var express = require('express'),
  app = module.exports = express(),
  bodyParser = require('body-parser'),
  multer = require('multer'),
  morgan = require('morgan'),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
  mongoStore = require('connect-mongo')(session);

var sanmoku = require('./routes/sanmoku'),
  login = require('./routes/login'),
  room = require('./routes/room'),
  path = require('path'),
  routes = require('./routes/index');

var server = require('http').Server(app),
  io = require('socket.io')(server);

var user = {};
var R1user = [], R2user = [], R3user = [];

// middleware
app.use(morgan({
  format : 'dev',
  immediate : true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended : true
}));
// app.use(multer());

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
server.listen(9000);
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

// room画面
app.post('/room', room.index);

// 三目並べ画面
app.get('/game', sanmoku.index);

// socket connect
io.sockets.on('connection', function(socket) {

  // 接続時
  socket.on('connected', function(data) {
    console.log("socket.io >> " + socket.id);
    var msg = data + " さんが入室しました";
    // user.push(data);
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
    console.log("送信先 => " + data.room);
    io.sockets.to(data.room).emit("screenGet", {
      btnId : data.btnId,
      koma : data.koma
    });
  });
  // ゲーム情報の共有
  socket.on('gameShare', function(data) {
    console.log("gameShare -start-");
    console.log("data >> " + data.player);
    console.log("送信先 => " + data.room);
    io.sockets.to(data.room).emit("turnShare", data.player);
  });

  // 勝負結果の共有
  socket.on('resultShare', function(data) {
    io.sockets.to(data.room).emit("result", data.winner);
  });

  // game画面接続時「
  socket.on('connectStart', function(data) {
    console.log("connectStart--start--");
    console.log("socket.id >> " + socket.id);

    user[socket.id] = {
      player : data.player,
      room : data.room
    };

    console.log("user -- " + user[socket.id].player);

    // room参加
    console.log("join room => " + data.room);
    socket.join(data.room);

    var username = [];

    switch (data.room) {

    case "room-1":
      R1user.push(data.player);
      username = R1user;
      break;

    case "room-2":
      R2user.push(data.player);
      username = R2user;
      break;

    case "room-3":
      R3user.push(data.player);
      username = R3user;
      break;
    }

    console.log("user array >> " + username);
    console.log("socket.count >> " + username.length);

    io.sockets.to(data.room).emit("sktCnt", username);

  });

  // 接続解除
  socket.on('disconnect', function(data) {

    var userInfo = Object.values(user[socket.id]);
    var userR = [];
    var target = userInfo[0];

    console.log("disconnect--start--");
    console.log("接続解除ID： " + socket.id);
    console.log("接続解除ユーザ： " + userInfo[0]);
    console.log("RooM： " + userInfo[1]);
    switch (userInfo[1]) {

    case "room-1":
      userR = R1user = R1user.filter(function(v, i) {
          return (v !== target);
      });
      break;

    case "room-2":
      userR = R2user = R2user.filter(function(v, i) {
            return (v !== target);
        });
      break;

    case "room-3":
      userR = R3user = R3user.filter(function(v, i) {
            return (v !== target);
        });      break;
    }
    console.log("userR to sktCnt： "+ userR);

    // console.log("socket.count >> " + user.length);
    // var msg = data + " さんが退出しました";
    io.sockets.to(userInfo[1]).emit("disconnect", userR);

    delete user[socket.id];
  });
});
// オブジェクトから値を取り出し、配列に格納する
if (!Object.values) {
  Object.values = function(obj) {
    var a = [], i = 0, p;
    for (p in obj)
      if (obj.hasOwnProperty(p)) {
        a[i++] = obj[p];
      }
    return a;
  };
}
//配列から値を指定して削除する
function rmArray(array,target){
 return  array.filter(function(v, i) {
    return (v !== target);
  });
}

