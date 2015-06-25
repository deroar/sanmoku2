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

exports.index = function(req,res){
	res.render('sanmoku/index',{screen:screen});
};

exports.pick = function(req,res){
	var formName = Object.keys(req.body); //req.bodyからkey部分を取り出す {name: "username" , a1: "○"}
	var winner = "";

	if(chkPick(chkPlayer , req)){ //処理するかの条件チェック

		screen[formName[1]]=input[turn];

		//判定
		if((winner = judge()) != ""){ //
			console.log("Winner > " + winner);
			res.render('sanmoku/result',{result:winner}); //どちらかが勝った場合のみ別ページに遷移させる ※画面リフレッシュで動いてない

		}else{ //
			//ターンの入れ替え
			exchangeTurn();
			//
			if(chkPlayer.length < 2){ //playerを格納している配列の長さが2未満なら配列にusernameを追加
				pushUsernmae(chkPlayer,eval("req.body." + formName[0]));
			}

			turnPlayer = eval("req.body." + formName[0]);
			res.render('sanmoku/index',{screen:screen});
		}

	}else{ //postされたvauleの値がブランクでなければエラーとする
		console.log("error");
	}
};

exports.init = function(req,res){
    //screenの初期化
	for(var key in screen ){
		screen[key]="";
	}
	//turnの初期化
	turn = 0;
	isRun = 1;
	turnPlayer = "";
	chkPlayer.length = 0;
 	res.render('sanmoku/index',{screen:screen});
};

function judge(){//縦のパターン：3,横のパターン：3,斜めパターン：2

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

	//前回実行時のnameと同じ場合は処理しない
	if(turnPlayer == eval("req.body." + formName[0])){
		return false;
	}
	//クリックしたボタンの値がブランクでない場合は処理しない
	if(eval("req.body." + formName[1]) != ""){
		return false;
	}
	//3人目の人がボタンをクリックしても処理しない
	if(array.length >= 2 && !isExists(array, eval("req.body." + formName[0]))){
		return false;
	}

	return true;
}
//turnの交換
function exchangeTurn(){

	if(turn == 0){
		turn=1;
	}else if(turn == 1){
		turn=0;
	}
}