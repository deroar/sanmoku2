$(function() {

  socket.on('connected', function(data) {
    addMessage(data.value);
  });
  socket.on('chatlog', function(data) {
      addlog(data);
   });

  socket.on('publish', function(data) {
    addMessage(data.value);
  });
  socket.on('disconnect', function(data) {
    // data = name;
  });

  // 関数定義
  $('#publishMessage').click(function() {
    var textInput = $('#msg_input').val();

    if (textInput != "") {
      var msg = "[" + name + "] " + textInput;
      socket.emit("publish", msg);
      $('#msg_input').val("");
    }
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
  socket.emit("connected", name);

});
