var turn = 0; // 0が先攻○”,1が後攻"×"
var input = [ "○", "×" ]; // turnにより○か×を選択する
var turnPlayer = ""; // turnPlayerの名前を格納
var chkPlayer = []; // player1とplayer2の名前を格納する
var isRun = 1; // ゲーム中1、ゲーム終了0
var winner = "";

$(function() {

	console.log("Player >> " + player);
	console.log("otherPlayer >> " + otherPlayer);

	$("#player").append(player);
	$("#otherplayer").append(otherPlayer);

	socket.on('connected', function(data) {

	});

	socket.on('disconnect', function(data) {

	});

	socket.on('screenGet', function(data) {

		console.log("screenGET -start-");
		console.log(input[turn % 2] + " : " + socket.id);

		console.log(btnId);

		$(data).val(input[turn % 2]);

	});

	socket.on('result', function(data) {
		console.log(">>result");

		if (data != "") {
			alert(data + " が勝利しました。");
		} else {
			alert("引き分けです。");
		}

		$("#init").prop("disabled", false);

	});

	$(".button").click(function() {
		var selectId = $(this).attr('id');

		var btnId = "#" + selectId;

		$(btnId).val(input[turn % 2]);

		winner = judge(turn);

		if(winner != ""){

			// screenShareを呼び出す
			callSocket(1);

			// 終了処理
			isRun = 0;

			callSocket(2);

		}else{
			// ターンの入れ替え
			turn++;

			if (turn > 8) {
				isRun = 0;
				callSocket(2);
			}
			// screenShareを呼び出す
			callSocket(1);
		}

		socket.emit("screenShare", btnId);
	});

	if (isRun == 1) { // ゲーム中の場合は、ROOMへボタンを無効化,
		$(".button").prop("disabled", false);
		$("#init").prop("disabled", true);
	} else if (isRun == 0) { // ゲーム後の場合は、ROOMへボタンを有効化する
		$(".button").prop("disabled", true);
		$("#init").prop("disabled", false);
	}

	socket.emit("connected", player);
});

function judge(turn) {// 縦のパターン：3,横のパターン：3,斜めパターン：2

	turn = turn % 2;

	var result = "";
	// 縦パターン
	if ($("#a1").val() == input[turn] && $("#b1").val() == input[turn]
			&& $("#c1").val() == input[turn] || $("#a2").val() == input[turn]
			&& $("#b2").val() == input[turn] && $("#c2").val() == input[turn]
			|| $("#a3").val() == input[turn] && $("#b3").val() == input[turn]
			&& $("#c3").val() == input[turn]) {
		result = input[turn];
	}

	// 横パターン
	// 横列が自分のターンの記号(input[turn])と同じならWin! a1=a2=a3=input[turn]
	if ($("#a1").val() == input[turn] && $("#a2").val() == input[turn]
			&& $("#a3").val() == input[turn] || $("#b1").val() == input[turn]
			&& $("#b2").val() == input[turn] && $("#b3").val() == input[turn]
			|| $("#c1").val() == input[turn] && $("#c2").val() == input[turn]
			&& $("#c3").val() == input[turn]) {
		result = input[turn];
	}

	// 斜めパターン
	// 斜め列が自分のターンの記号(input[turn])と同じならWin! a1=b2=c3=input[turn]
	if ($("#a1").val() == input[turn] && $("#b2").val() == input[turn]
			&& $("#c3").val() == input[turn] || $("#c1").val() == input[turn]
			&& $("#b2").val() == input[turn] && $("#a3").val() == input[turn]) {

		result = input[turn];
	}
	console.log("result > " + result);

	return result;
}
//nameの重複チェック
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
function chkPick(array, req) {
	var formName = Object.keys(req.body);

	// クリックしたボタンの値がブランクでない場合は処理しない
	if (req.body[formName[1]] != "") {
		console.log("error1");
		return false;
	}

	// 前回実行時のnameと同じ場合は処理しない
	if (turnPlayer == req.body[formName[0]]) {
		console.log("error2: " + turnPlayer);
		return false;
	}

	// 3人目の人がボタンをクリックしても処理しない
	if (array.length >= 2 && !isExists(array, req.body[formName[0]])) {
		console.log("error3");
		return false;
	}

	// ゲームが終了している場合
	if (isRun == 0) {
		console.log("error4");
		return false;
	}

	return true;
}
// socketを呼び出す
function callSocket(num) {

	switch (num) {

	case 1:
		console.log("call socket >> screenshare");
		socket.emit('screenShare', screen ,function() {
		});
		break;

	case 2:
		console.log("call socket >> resultshare");
		socket.emit('resultShare', winner, function() {
		});
		break;
	}
}
// 初期化
function initGame() {

	if (isRun == 0) {

		// screenの初期化
		for ( var key in screen) {
			screen[key] = "";
		}
		turn = 0;

		// 初期化
		isRun = 1;
		turnPlayer = "";
		winner = "";
//		chkPlayer.length = 0;
	}
}
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
