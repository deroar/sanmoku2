var rstatus = ["空き","対戦待ち","対戦中"];

$(function() {

  lobby.on('connected', function(data) {
    addMessage(data.value);
  });

  lobby.on('roomInfo',function(data){
    console.log("roomInfo--start--");
    console.log("R1 : "+ data.r1Num + " 状況 : " + rstatus[data.r1Num]);
    console.log("R2 : "+ data.r2Num + " 状況 : " + rstatus[data.r2Num]);
    console.log("R3 : "+ data.r3Num + " 状況 : " + rstatus[data.r3Num]);

    //接続人数
    $('#r1cnt').text(data.r1Num);
    $('#r2cnt').text(data.r2Num);
    $('#r3cnt').text(data.r3Num);


    //ROOM状況
    if(data.r1Num <= 2){
        $('#r1st').text(rstatus[data.r1Num]);
    }else{
        $('#r1st').text(rstatus[2]);
    }

    if(data.r2Num <= 2){
        $('#r2st').text(rstatus[data.r2Num]);
    }else{
        $('#r2st').text(rstatus[2]);
    }

    if(data.r3Num <= 2){
        $('#r3st').text(rstatus[data.r3Num]);
    }else{
        $('#r3st').text(rstatus[2]);
    }

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
  $('#talk').click(function() {
    var textInput = $('#msg_input').val();

    if (textInput != "") {
      var msg = "[" + name + "] " + textInput;
      lobby.emit("publish", msg);
      $('#msg_input').val("");
    }
  });

  $('.subroom').click(function(){

    var msg = name + " さんは、" + $(this).parent().parent().parent().find('td:eq(0)').text() + "に入室しました";

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

  //
  lobby.emit("getRoomInfo",function(data){

  });


});

