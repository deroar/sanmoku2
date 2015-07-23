var mongoose = require('mongoose');
var url = 'mongodb://localhost/user';
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
  name : String,
  win : Number,
  lose : Number
},{
  collection : 'result'
});

exports.User = db.model('User', UserSchema);
exports.Result = db.model('Result', gameResult);