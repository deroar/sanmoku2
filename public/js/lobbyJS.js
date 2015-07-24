$(function() {

  lobby.on('connected', function(data) {
    addMessage(data.value);
  });
  lobby.on('chatlog', function(data) {
    console.log("chatlog--------");
      addlog(data);
   });

  lobby.on('publish', function(data) {
    addMessage(data.value);
  });
  lobby.on('disconnect', function(data) {
    // data = name;
  });

  // 関数定義
  $('#publishMessage').click(function() {
    var textInput = $('#msg_input').val();

    if (textInput != "") {
      var msg = "[" + name + "] " + textInput;
      lobby.emit("publish", msg);
      $('#msg_input').val("");
    }
  });

  $('.subroom').click(function(){

    var msg = name + " は、" + $('#selroom option:selected').text() + "に入室しました。";

    lobby.emit("publish", msg);
  });

  function addMessage(msg) {
    var obj = $(document.createElement('div'));
    obj.html(msg);
    $('#msg').append(obj);

  }

  function addlog(msglog) {
      var obj = $(document.createElement('chatlog'));
      obj.html(msglog);
      $('#log').append(msglog);
    }

  // 開始処理
  // 入室時に名前を表示

  addMessage("ようこそ、" + name + " さん");

  // 名前をemitする
  lobby.emit("connected", name);

});

