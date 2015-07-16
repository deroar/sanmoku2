$(function() {

	var turn = 0; // 0が先攻○”,1が後攻"×"
	var input = [ "○", "×" ]; // turnにより○か×を選択する
	var turnPlayer = ""; // turnPlayerの名前を格納
	var chkPlayer = []; // player1とplayer2の名前を格納する
	var isRun = 1; // ゲーム中1、ゲーム終了0
	var winner = "";


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
		console.log(input[turn%2] + " : " + socket.id );
		var btnId = "#" + data;

		console.log(btnId);

		$(btnId).val(input[turn%2]);

		console.log(judge(turn));

		turn++;

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

	$(".button").click(function(){
		var selectId = $(this).attr('id');
		socket.emit("screenShare",selectId);
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
	for (var i = 1; i < 4; i++) {
		// 縦列が自分のターンの記号(input[turn])と同じならWin! a1=b1=c1=input[turn]
		if (screen[eval("'a" + i + "'")] == input[turn]
				&& screen[eval("'b" + i + "'")] == input[turn]
				&& screen[eval("'c" + i + "'")] == input[turn]) {
			result = input[turn];
		}
	}
	// 縦パターン
	// 横列が自分のターンの記号(input[turn])と同じならWin! a1=a2=a3=input[turn]
	if (screen[eval("'a1'")] == input[turn]
			&& screen[eval("'a2'")] == input[turn]
			&& screen[eval("'a3'")] == input[turn]
			|| screen[eval("'b1'")] == input[turn]
			&& screen[eval("'b2'")] == input[turn]
			&& screen[eval("'b3'")] == input[turn]
			|| screen[eval("'c1'")] == input[turn]
			&& screen[eval("'c2'")] == input[turn]
			&& screen[eval("'c3'")] == input[turn]) {
		result = input[turn];
	}

	// 斜めパターン
	// 斜め列が自分のターンの記号(input[turn])と同じならWin! a1=b2=c3=input[turn]
	if (screen[eval("'a1'")] == input[turn]
			&& screen[eval("'b2'")] == input[turn]
			&& screen[eval("'c3'")] == input[turn]
			|| screen[eval("'c1'")] == input[turn]
			&& screen[eval("'b2'")] == input[turn]
			&& screen[eval("'a3'")] == input[turn]) {

		result = input[turn];
	}
	console.log("result > " + result);

	return result;
}
