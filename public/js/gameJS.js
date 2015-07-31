var input = [ "○", "×" ]; // turnにより○か×を選択する
var turnPlayer = ""; // turnPlayerの名前を格納
var chkPlayer = []; // player1とplayer2の名前を格納する
var isRun = 0; // ゲーム中1、ゲーム終了0
var winner = "";
var turn = 0; // 0が先攻○”,1が後攻"×"

$(function() {

  console.log("--Game start--");
  console.log("Player >> " + player);
  console.log("Room >> " + room);

  // 自プレイヤー名を表示
  $("#player").html(player);

  gsocket.on('connected', function(data) {

  });

  gsocket.on('disconnect', function(data) {
    if(data.length == 1 && isRun == 1){
      alert("対戦相手がゲームから離れました。");
      isRun = 0;
      validBtn(isRun);
    }
  });

  gsocket.on('screenInit', function(data) {

    console.log("screenInit--start--");
    console.log(data.screen['a1']);


      $('#a1').val(data.screen['a1']);
      $('#a2').val(data.screen['a2']);
      $('#a3').val(data.screen['a3']);
      $('#b1').val(data.screen['b1']);
      $('#b2').val(data.screen['b2']);
      $('#b3').val(data.screen['b3']);
      $('#c1').val(data.screen['c1']);
      $('#c2').val(data.screen['c2']);
      $('#c3').val(data.screen['c3']);

    });

  gsocket.on('screenGet', function(data) {

    var btn = "#" + data.btnId;
    $(btn).val(data.koma);

  });

  gsocket.on('turnShare', function(data) {
    turnPlayer = data;
    turn++;
  });

  gsocket.on('sktCnt', function(data) {
      console.log("sktCnt--start--");

    var otherPlayer = getOtherPlayer(player, data);

    console.log(data);
    console.log("接続人数 >> " + data.length);

    if (data.length == 2) {

      $("#otherplayer").text(otherPlayer);
      isRun = 1;
      validBtn(isRun);
      chkPlayer.length = 0;
      chkPlayer[0] = player;
      chkPlayer[1] = otherPlayer;
    }
  });

  //結果時の処理
  gsocket.on('result', function(data) {

    if (data != "") {
      alert(data + " が勝利しました。");
    } else {
      alert("引き分けです。");
    }

    isRun = 0;

    $("#init").prop("disabled", false);

  });

  //ボタンクリック時の処理
  $(".button").click(function() {

  //ボタンIDの取得
    var selectId = $(this).attr('id');

    var btnId = "#" + selectId;


      //画面データの共有
      gsocket.emit("screenShare", {

        btnId : selectId,
        player : player,
        koma : input[turn % 2],
        room : room
      });


  });

  $(".button2").click(function() {
    turnPlayer = "";
    turn = 0;
    gsocket.emit("disconnet", {player:player});
  });

  if (isRun == 1) { // ゲーム中の場合は、ROOMへボタンを無効化,
    $(".button").prop("disabled", false);
    $("#init").prop("disabled", true);
  } else if (isRun == 0) { // ゲーム後の場合は、ROOMへボタンを有効化する
    $(".button").prop("disabled", true);
    $("#init").prop("disabled", false);
  }

});

function validBtn(data) {

  if (data == 1) { // ゲーム中の場合は、ROOMへボタンを無効化,
    $(".button").prop("disabled", false);
    $("#init").prop("disabled", true);
  } else if (data == 0) { // ゲーム後の場合は、ROOMへボタンを有効化する
    $(".button").prop("disabled", true);
    $("#init").prop("disabled", false);
  }
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

// 初期化
function initGame() {

  if (isRun == 1) {

    turn = 0;

    // 初期化
    isRun = 0;
    turnPlayer = "";
    winner = "";
    // chkPlayer.length = 0;
  }
}
//対戦相手のnameを取得する
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
