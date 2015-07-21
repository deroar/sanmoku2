var input = [ "○", "×" ]; // turnにより○か×を選択する
var turnPlayer = ""; // turnPlayerの名前を格納
var chkPlayer = []; // player1とplayer2の名前を格納する
var isRun = 0; // ゲーム中1、ゲーム終了0
var winner = "";
var turn = 0; // 0が先攻○”,1が後攻"×"

$(function() {

	console.log("Player >> " + player);
	// 自プレイヤー名を表示
	$("#player").html(player);

	socket.on('connected', function(data) {

	});

	socket.on('disconnect', function(data) {

	});

	socket.on('screenGet', function(data) {

		$(data.btnId).val(data.koma);

	});

	socket.on('turnShare', function(data) {
		turnPlayer = data;
		turn++;
	});

	socket.on('sktCnt', function(data) {

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

	socket.on('result', function(data) {

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

		console.log("turn >> " + turn);

		if (chkPick(chkPlayer, player, $(btnId).val())) {

			$(btnId).val(input[turn % 2]);

			socket.emit("screenShare", {
				btnId : btnId,
				koma : input[turn % 2]
			});

			winner = judge(turn, btnId);

			console.log("winner >> " + winner);

			if (winner != "") {

				// 終了処理
				isRun = 0;

				callSocket(2);

			} else {

				// turnを進める
				socket.emit("gameShare", {
					player : player
				});

				if (turn >= 8) {
					isRun = 0;
					callSocket(2);
				}
			}
		}
	});

	$(".button2").click(function() {
		turnPlayer = "";
		turn = 0;
		socket.emit("disconnet", {player:player});
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
function chkPick(array, player, btnVal) {

	/*
	 * console.log("条件チェック開始--"); console.log("前提--start--"); console.log("turn >> " +
	 * turn); console.log("before turnPlayer >> " + turnPlayer);
	 * console.log("koma >> " + input[turn%2]); console.log("前提--end--");
	 */
	// クリックしたボタンの値がブランクでない場合は処理しない
	if (btnVal != "") {
		console.log("error1");
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
		socket.emit('screenShare', screen, function() {
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

	if (isRun == 1) {

		turn = 0;

		// 初期化
		isRun = 0;
		turnPlayer = "";
		winner = "";
		// chkPlayer.length = 0;
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
