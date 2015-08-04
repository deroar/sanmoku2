var mongoose = require('mongoose');
var url = 'mongodb://localhost/sanmoku';
var db = mongoose.createConnection(url, function(err, res) {
  if (err) {
    console.log('Error connected: ' + url + ' - ' + err);
  } else {
    console.log('Success connected: ' + url);
  }
});

// Modelの定義
var UserSchema = new mongoose.Schema({
  name : String,
  logNum: Number,
  rankP: Number
}, {
  collection : 'game'
});

var gameResult = new mongoose.Schema({
  name : {type:String, default:''},
  win  : {type:Number, default:0},
  lose : {type:Number, default:0},
  draw : {type:Number, default:0}
},{
  collection : 'result'
});
var roomInfo = new mongoose.Schema({
    room 	: {type: String ,    default: ''},
    screen 	: {type: {} , default:''},
    isRun 	: {type: Number , 	default: 0},
    turn 	: {type: Number , 	default: 0},
    users	: {type: [] , default: ''},
    turnPlayer: {type: String , default: ''}
  },{
    collection : 'room'
  });

var chatLog = new mongoose.Schema({
  msg : String
},{
  collection : 'chatdev'
});

exports.User = db.model('User', UserSchema);
exports.Result = db.model('Result', gameResult);
exports.Chat = db.model('Chat', chatLog);
exports.Room = db.model('Room', roomInfo);