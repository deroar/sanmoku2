var express = require('express'), app = module.exports = express(), bodyParser = require('body-parser'), morgan = require('morgan'), cookieParser = require('cookie-parser'), session = require('express-session'), mongoStore = require(
    'connect-mongo')(session);

var sanmoku = require('./routes/sanmoku'), login = require('./routes/login'), lobby = require('./routes/lobby'), path = require('path'), index = require('./routes/index'), model = require('./model.js'), Chat = model.Chat, Room = model.Room, Result = model.Result;

var server = require('http').Server(app), io = require('socket.io')(server), loginSocket = io
    .of('/'), lobbySocket = io.of('/lobby'), gameSocket = io.of('/game');

// グローバル宣言
var user = {};

var koma = [ "○", "×" ]; // turnにより○か×を選択する
var roomNum = {"room-1" : 0, "room-2" : 0, "room-3" : 0 };
/*
Room.remove({}, function() {
  console.log("collections:roomを初期化");
});
*/
function roomInfo() {
  this.screen = {
    a1 : "", a2 : "", a3 : "",
    b1 : "", b2 : "", b3 : "",
    c1 : "", c2 : "", c3 : ""
  };
  this.isRun = 0;
  this.turn = 0;
  this.users = [];
  this.turnPlayer = "";
}

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
  console.log("logincheck >> " + req.session.user);

  if (req.session.user) {
    console.log("logincheck -> next");

    next();
  } else {
    console.log("logincheck -> login");
    res.redirect('/login');
  }
};

// ログイン画面

app.set('view engine', 'ejs');

app.get('/', loginCheck, index.index);

app.get('/login', index.login);

app.post('/add', index.add);

app.get('/logout', function(req, res) {
  req.session.destroy();
  console.log('deleted session');
  res.redirect('/');
});

// room画面
app.post('/lobby', lobby.index);

// 三目並べ画面
app.get('/game', sanmoku.index);

// lobbySocket = io.of('/lobby')
loginSocket.on('connection', function(socket) {

  socket.on('connected', function(data) {

  });

  socket.on('disconnect', function(data) {

  });

});

// lobbySocket = io.of('/lobby')
lobbySocket.on('connection', function(socket) {

  var userHash = {};

  // 接続時
  socket.on('connected', function(data) {
    userHash[socket.id] = data;
    console.log("socket.io >> " + socket.id);
    var msg = new Date().toLocaleTimeString() + " " + data
        + " さんが、Lobbyに入室しました";
    // user.push(data);

    Chat.find({}, {
      _id : 0
    }, {
      limit : 20
    }, function(err, msglog) {
      var log = "";
      if (err) {
        console.log(err);
      }

      if (msglog == "") {
        console.log("No data.");
      } else {

        for ( var key in msglog) {
          log += msglog[key].msg + "<br>";
        }

        lobbySocket.to(socket.id).emit('chatlog', log);
      }
    }).sort({
      _id : -1
    });

    var chat = new Chat();
    chat['msg'] = msg;
    chat.save(function(err) {
      if (err) {
        console.log(err);
      }
    });

    lobbySocket.emit("publish", {
      value : msg
    });
  });

  // ルーム情報の表示
  socket.on('getRoomInfo', function(data) {
    lobbySocket.emit("roomInfo", {
      r1Num : roomNum["room-1"],
      r2Num : roomNum["room-2"],
      r3Num : roomNum["room-3"]
    });
  });

  // メッセージ送信
  socket.on('publish', function(data) {

    var msg = new Date().toLocaleTimeString() + " " + data;

    var chat = new Chat();
    chat['msg'] = msg;
    chat.save(function(err) {
      if (err) {
        console.log(err);
      }
    });

    lobbySocket.emit("publish", {
      value : msg
    });
  });

  // 接続解除
  socket.on('disconnect', function(data) {

    if (userHash[socket.id]) {
      var msg = new Date().toLocaleTimeString() + " "
          + userHash[socket.id] + " さんが、Lobbyから退出しました";

      var chat = new Chat();
      chat['msg'] = msg;
      chat.save(function(err) {
        if (err) {
          console.log(err);
        }
      });

      delete userHash[socket.id];

      // 退室のメッセージを送信する
      lobbySocket.emit("publish", {
        value : msg
      });

      // ROOM情報を更新する
      lobbySocket.emit("roomInfo", {
        r1Num : roomNum["room-1"],
        r2Num : roomNum["room-2"],
        r3Num : roomNum["room-3"]
      });
    }
  });
});

// gameSocket = io.of('/game');
gameSocket.on('connection', function(socket) {

  var chkPlayer = [], // player1とplayer2の名前を格納する
  winner = "";

  // 接続時
  socket.on('connected', function(data) {

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
    var screen = {
      a1 : "", a2 : "", a3 : "",
      b1 : "", b2 : "", b3 : "",
      c1 : "", c2 : "", c3 : ""
    };

    Room.find({
      "room" : data.room
    }, function(err, info) {

      if (err) {
        console.log(err);
      }

      // DBにルームのデータがない場合は、空のドキュメントを作成
      if (info == "") {

        Room.update({"room" : data.room}, {$set : {"turnPlayer" : "", users : "", "turn" : 0, "isRun" : 0, "screen" : "", "room" : data.room } }, {
          upsert : true
        }, function(err, res) {
          if (err) {
            console.log("roomInfo Update error");
          }

        });

      } else {

        username = info[0].users;

        if (username.length < 2 && info[0].isRun == 1) {

          Room.update({ "room" : data.room }, { $set : {"turnPlayer" : "", users : "", "users" : [],"turn" : 0, "isRun" : 0, "screen" : "", "room" : data.room } }, {
            upsert : true
          }, function(err, res) {
            if (err) {
              console.log("roomInfo Update error");
            }
          });
        }

      }

      // 取得したusernameの長さで処理を分ける
      if (username.length == 0) {

        username.push(data.player);

        // ゲームが始まる前にドキュメントの作成
        Room.update({ "room" : data.room }, { $set : { users : username, "turn" : 0, "isRun" : 0} }, {upsert : true }, function(err, res) {
          if (err) {
            console.log("roomInfo Update error");
          }

        });

      } else if (username.length == 1) {

        username = info[0].users;
        username.push(data.player);

        console.log("ゲーム接続人数 " + username.length);
        Room.update({"room" : data.room }, { $set : { users : username, "turn" : 0, "isRun" : 1, "screen" : screen}}, {upsert : true}, function(err, res) {
          if (err) {
            console.log("roomInfo Update error");
          }

        });

        // 対戦開始のメッセージを送信
        var msg = new Date().toLocaleTimeString() + " " + username[0]
            + " さんと " + username[1] + " さんがゲームを開始しました(" + data.room + ")";

        var chat = new Chat();
        chat['msg'] = msg;
        chat.save(function(err) {
          if (err) {
            console.log(err);
          }
        });

        // 開始のメッセージをlobbyに送信する
        lobbySocket.emit("publish", {
          value : msg
        });

      } else if (username.length >= 2) {

        // 盤面の初期化
        gameSocket.to(data.room).emit("screenInit", {
          screen : info[0].screen
        });

      }

      gameSocket.to(data.room).emit("sktCnt", username);

      roomNum[data.room] = username.length;

      // ROOM情報を更新する
      lobbySocket.emit("roomInfo", {
        r1Num : roomNum["room-1"],
        r2Num : roomNum["room-2"],
        r3Num : roomNum["room-3"]
      });

    });

  });
  // 画面データの共有
  socket.on('screenShare', function(data) {
    console.log("screenShare -start-");
    console.log("送信先 => " + data.room);

    // 画面データの共有
    /*
     * dataの中身 btnId : selectId, player : palyer, koma : input[turn % 2],
     * room : room
     */

    console.log("チェック前処理(DB情報)--start--");

    Room.find({
      "room" : data.room
    }, function(err, info) {

      if (err) {
        console.log(err);
      }
      // ドキュメントがなければエラーメッセージ
      if (info == "") {
        console.log("no data in " + data.room);
      } else {

        var turn = info[0].turn;

        console.log("screen--start--");

        // 盤面処理の確認
        if (chkPick(info[0].users, info[0].turnPlayer, data.player,
            info[0].screen[data.btnId], info[0].isRun)) {

          // 盤面情報の処理
          // 今のターンで押されたscreen情報を追加
          info[0].screen[data.btnId] = koma[turn % 2];

          console.log("info screen " + info[0].screen[data.btnId]);

          // 盤面情報の共有
          gameSocket.to(data.room).emit("screenGet", {
            screen : info[0].screen,
            btnId : data.btnId,
            koma : koma[turn % 2]
          });

          winner = judge(turn, info[0].screen);

          if (winner != "" || turn >= 8) {

            gameSocket.to(data.room).emit('result', winner);

            if (winner != "") {

              // 勝者の結果を格納
              Result.update({"name" : info[0].users[turn % 2] }, { $set : { "name" : info[0].users[turn % 2] }, $inc : { win : 1 } }, {
                upsert : true
              }, function(err) {
                if (err) {
                  console.log("Error: Result Update " + err);

                } else {
                  console.log("Success: Result update");
                }
              });
              // 敗者の結果を格納
              Result.update({ "name" : info[0].users[(turn + 1) % 2] }, { $set : { "name" : info[0].users[(turn + 1) % 2] }, $inc : {lose : 1}}, {
                upsert : true
              }, function(err) {
                if (err) {
                  console.log("Error: Result Update " + err);

                } else {
                  console.log("Success: Result update");
                }
              });

            } else {

              // 引き分けの場合
              Result.update({ "name" : info[0].users[turn % 2]}, {$set : {"name" : info[0].users[turn % 2]},$inc : {draw : 1}}, {
                upsert : true
              }, function(err) {
                if (err) {
                  console.log("Error: Result Update " + err);

                } else {
                  console.log("Success: Result update");
                }
              });
              // 引き分けの場合
              Result.update({ "name" : info[0].users[(turn + 1) % 2]}, { $set : { "name" : info[0].users[(turn + 1) % 2] }, $inc : { draw : 1 }}, {
                upsert : true
              }, function(err) {
                if (err) {
                  console.log("Error: Result Update " + err);

                } else {
                  console.log("Success: Result update");
                }
              });

            }

            console.log("ゲーム終了後の初期化処理--start--");
            console.log("room >> " + data.room);
            Room.update({ "room" : data.room }, { $set : {"isRun" : 0,"turn" : 0,"turnPlayer" : "","screen" : ""}}, function(err) {
              if (err) {
                console.log("roomInfo init Update error");
              } else {
                console.log("init success >> " + err);
              }
            });
            winner = "";
            info[0].screen = {
              a1 : "", a2 : "", a3 : "",
              b1 : "", b2 : "", b3 : "",
              c1 : "", c2 : "", c3 : ""
            };

            // 盤面の初期化
            gameSocket.to(data.room).emit("screenInit", {
              screen : info[0].screen,
            });

          } else {

            // 次のターンへの処理

            Room.update({ "room" : data.room }, { $inc : { "turn" : 1 }, $set : { "turnPlayer" : data.player, "screen" : info[0].screen } }, function(err) {
              if (err) {
                console.log("roomInfo next Update error");
              } else {
                console.log("next turn success >> " + data.room);
              }
            });
          }
        } else {
          // 処理チェックでエラーの場合

        }

      }
    });
  });

  // ゲーム情報の共有
  socket.on('gameShare', function(data) {
    console.log("gameShare -start-");
    console.log("data >> " + data.player);
    console.log("送信先 => " + data.room);
    gameSocket.to(data.room).emit("turnShare", data.player);
  });

  // 勝負結果の共有
  socket.on('resultShare', function(data) {
    gameSocket.to(data.room).emit("result", data.winner);
  });

  // 接続解除
  socket.on('disconnect', function(data) {

    var userInfo = Object.values(user[socket.id]);
    var username = [];
    var target = userInfo[0];

    console.log("disconnect--start--");
    console.log("接続解除ID： " + socket.id);
    console.log("接続解除ユーザ： " + userInfo[0]);
    console.log("RooM： " + userInfo[1]);

    // ゲーム中の離脱処理
    Room.find({
      "room" : userInfo[1]
    }, function(err, info) {

      if (err) {
        console.log(err);
      }

      // ゲーム中の場合、勝敗を付ける
      if (info[0].isRun == 1) {

        var player = getOtherPlayer(userInfo[0], info[0].users);

        // 勝者の結果を格納
        Result.update({ "name" : player }, { $set : { "name" : player }, $inc : { win : 1 }}, {upsert : true}, function(err) {
          if (err) {
            console.log("Error: Result Update " + err);

          } else {
            console.log("Success: Result update");
          }
        });
        // 敗者の結果を格納
        Result.update({"name" : userInfo[0] }, { $set : { "name" : userInfo[0]},$inc : {lose : 1} }, {
          upsert : true
        }, function(err) {
          if (err) {
            console.log("Error: Result Update " + err);

          } else {
            console.log("Success: Result update");
          }
        });
      }

      username = info[0].users;

      username = username.filter(function(v, i) {
        return (v !== target);
      });

      roomNum[userInfo[1]] = username.length;

      gameSocket.to(userInfo[1]).emit("disconnect", username);

      delete user[socket.id];

      console.log("ゲーム終了後の初期化処理--start--");
      console.log("room >> " + userInfo[1]);
      console.log("users >> " + username);

      if (username.length < 2) {
        Room.update({"room" : userInfo[1]}, {$set : {"isRun" : 0,"turn" : 0,"turnPlayer" : "","screen" : "", users : username } }, function(err) {
          if (err) {
            console.log("roomInfo init Update error");
          } else {
            console.log("init success");
          }
        });

        var screen = {
          a1 : "", a2 : "", a3 : "",
          b1 : "", b2 : "", b3 : "",
          c1 : "", c2 : "", c3 : ""
        };

        // 盤面の初期化
        gameSocket.to(data.room).emit("screenInit", {screen : screen});
      }

    });
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
// 配列から値を指定して削除する
function rmArray(array, target) {
  return array.filter(function(v, i) {
    return (v !== target);
  });
}

function judge(turn, screen) {// 縦のパターン：3,横のパターン：3,斜めパターン：2

  turn = turn % 2;

  var result = "";
  // 縦パターン
  if (screen["a1"] == koma[turn] && screen["b1"] == koma[turn]
      && screen["c1"] == koma[turn] || screen["a2"] == koma[turn]
      && screen["b2"] == koma[turn] && screen["c2"] == koma[turn]
      || screen["a3"] == koma[turn] && screen["b3"] == koma[turn]
      && screen["c3"] == koma[turn]) {
    result = koma[turn];
  }

  // 横パターン
  // 横列が自分のターンの記号(koma[turn])と同じならWin! a1=a2=a3=koma[turn]
  if (screen["a1"] == koma[turn] && screen["a2"] == koma[turn]
      && screen["a3"] == koma[turn] || screen["b1"] == koma[turn]
      && screen["b2"] == koma[turn] && screen["b3"] == koma[turn]
      || screen["c1"] == koma[turn] && screen["c2"] == koma[turn]
      && screen["c3"] == koma[turn]) {
    result = koma[turn];
  }

  // 斜めパターン
  // 斜め列が自分のターンの記号(koma[turn])と同じならWin! a1=b2=c3=koma[turn]
  if (screen["a1"] == koma[turn] && screen["b2"] == koma[turn]
      && screen["c3"] == koma[turn] || screen["c1"] == koma[turn]
      && screen["b2"] == koma[turn] && screen["a3"] == koma[turn]) {

    result = koma[turn];
  }
  return result;
}
// nameの重複チェック
function isExists(array, value) {
  // 配列の最後までループ
  for (var i = 0, len = array.length; i < len; i++) {
    if (value == array[i]) {
      // 存在したらtrueを返す
      return true;
    }
  }
  // 存在しない場合falseを返す
  return false;
}
// chkPlayerの配列内に名前がなければ格納する
function pushUsernmae(array, value) {

  if (!isExists(array, value)) {
    array.push(value);
  }
  return true;
}
// 処理をするかの条件チェック
function chkPick(array, turnPlayer, player, btnVal, gameRun) {

  // クリックしたボタンの値がブランクでない場合は処理しない
  if (btnVal != "") {
    console.log("error1: " + btnVal);
    return false;
  }

  // 2連続で推しても処理しない
  if (turnPlayer == player) {
    console.log("error2: " + turnPlayer);
    return false;
  }

  // 3人目の人がボタンをクリックしても処理しない
  if (array.length >= 2 && !isExists(array, player)) {
    console.log("error3");
    return false;
  }

  // ゲームが終了している場合
  if (gameRun == 0) {
    console.log("error4: " + gameRun);
    return false;
  }

  return true;
}

// 対戦相手のnameを取得する
function getOtherPlayer(name, array) {

  var otherPlayer = "";

  if (array.length != 2) {
    return false;
  }

  if (array[0] == name) {
    otherPlayer = array[1];

  } else if (array[1] == name) {
    otherPlayer = array[0];
  }

  return otherPlayer;
}
