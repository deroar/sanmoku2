var io = require('socket.io-client');
var socket = io.connect('http://192.168.33.72:3000');

var screen ={ //9マス　a*は1段目、b*は2段目、c*は3段目
   a1:"",a2:"",a3:"",
   b1:"",b2:"",b3:"",
   c1:"",c2:"",c3:""
   };
var turn = 0; //0が先攻○”,1が後攻"×"
var input = ["○","×"]; //turnにより○か×を選択する

var turnPlayer = ""; //turnPlayerの名前を格納
var chkPlayer = []; //player1とplayer2の名前を格納する

var isRun = 1; //ゲーム中1、ゲーム終了0

var winner = "";


exports.index = function(req,res){

	//初期化
	initGame();

	if(chkPlayer.length < 2){ //playerを格納している配列の長さが2未満なら配列にusernameを追加
		pushUsernmae(chkPlayer,req.query.name);
	}

	//デバッグ用
	for(var i = 0;i <2;i++){
		console.log("chkPlayer > " + chkPlayer[i]);
	}

	res.render('sanmoku/index',{screen:screen ,username:req.query.name});
};

exports.pick = function(req,res){

	var formName = Object.keys(req.body); //req.bodyからkey部分を取り出す {name: "username" , a1: "○"}

	//デバッグ用
	console.log("turn > "  + turn);
	console.log("turnPlayer > " + turnPlayer);
	console.log("req.body > " +  req.body[formName[0]]);

	if(chkPick(chkPlayer , req)){ //処理するかの条件チェック

		screen[formName[1]]=input[turn%2]; //盤面に○、×をつける

		winner =judge(turn);
		console.log("Winner > " + winner);

		//判定
		if(winner != ""){ //

			//screenShareを呼び出す
			callSocket(1);

			//終了処理
			isRun = 0;

			res.render('sanmoku/index',{screen:screen,username:chkPlayer[turn%2]});

			if(winner != ""){
				socket.emit('resultShare',winner,function(){
				});
			}

		}else{

			//ターンの入れ替え
			turn++ ;

			//screenShareを呼び出す
			callSocket(1);

			turnPlayer = req.body[formName[0]];

			res.render('sanmoku/index',{screen:screen , username:chkPlayer[(turn + 1) % 2]});

		}

	}else{ //chkPickの返り値がfalseの場合はエラーとする
		console.log("error");
		res.render('sanmoku/index',{screen:screen , username:req.body[formName[0]]});
	}
};

exports.init = function(req,res){

	chkPlayer.length = 0;

	socket.emit('screenShare',screen,function(){
		console.log("sanmoku emit");
	});

	res.render('sanmoku/index',{screen:screen,winner : winner});

};

function judge(turn){//縦のパターン：3,横のパターン：3,斜めパターン：2

	turn = turn %2;

var result = "";
//縦パターン
	for(var i = 1; i < 4; i++){
		//縦列が自分のターンの記号(input[turn])と同じならWin! a1=b1=c1=input[turn]
		if(screen[eval("'a"+i+"'")] == input[turn] && screen[eval("'b"+i+"'")] == input[turn] && screen[eval("'c"+i+"'")] == input[turn]){
			result = input[turn];
		}
	}
//縦パターン
//横列が自分のターンの記号(input[turn])と同じならWin! a1=a2=a3=input[turn]
	if(screen[eval("'a1'")] == input[turn] && screen[eval("'a2'")] == input[turn] && screen[eval("'a3'")] == input[turn] ||
			screen[eval("'b1'")] == input[turn] && screen[eval("'b2'")] == input[turn] && screen[eval("'b3'")] == input[turn] ||
				screen[eval("'c1'")] == input[turn] && screen[eval("'c2'")] == input[turn] && screen[eval("'c3'")] == input[turn]){
		result = input[turn];
	}

//斜めパターン
//斜め列が自分のターンの記号(input[turn])と同じならWin! a1=b2=c3=input[turn]
	if(screen[eval("'a1'")] == input[turn] && screen[eval("'b2'")] == input[turn] && screen[eval("'c3'")] == input[turn] ||
			screen[eval("'c1'")] == input[turn] && screen[eval("'b2'")] == input[turn] && screen[eval("'a3'")] == input[turn]){

		result = input[turn];
	}
	console.log("result > " + result);

	return result;
}

//nameの重複チェック
function isExists(array, value) {
	  // 配列の最後までループ
	  for (var i =0, len = array.length; i < len; i++) {
	    if (value == array[i]) {
	      // 存在したらtrueを返す
	      return true;
	    }
	  }
	  // 存在しない場合falseを返す
	  return false;
}
//chkPlayerの配列内に名前がなければ格納する
function pushUsernmae(array,value){

	if(!isExists(array, value)){
		array.push(value);
	}
	return true;
}
//処理をするかの条件チェック
function chkPick(array , req){
	var formName = Object.keys(req.body);

	//クリックしたボタンの値がブランクでない場合は処理しない
	if(req.body[formName[1]] != ""){
		console.log("error1");
		return false;
	}

	//前回実行時のnameと同じ場合は処理しない
	if(turnPlayer == req.body[formName[0]]){
		console.log("error2: "+ turnPlayer);
		return false;
	}

	//3人目の人がボタンをクリックしても処理しない
	if(array.length >= 2 && !isExists(array, req.body[formName[0]])){
		console.log("error3");
		return false;
	}

	//ゲームが終了している場合
	if(isRun == 0){
		console.log("error4");
		return false;
	}

	return true;
}
//socketを呼び出す
function callSocket(data){

	switch(data){

	case 1:
		socket.emit('screenShare',screen,function(){
		});
		break;
	}
}

//初期化
function initGame(){

	if(turn > 0 ){

		//screenの初期化
		for(var key in screen ){
			screen[key]="";
		}
		turn = 0;

		//初期化
		isRun = 1;
		turnPlayer = "";
		winner = "";


	}

}
