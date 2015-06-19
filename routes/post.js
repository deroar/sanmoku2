var screen ={　//9マス　a*は1段目、b*は2段目、c*は3段目
   a1:"",a2:"",a3:"",
   b1:"",b2:"",b3:"",
   c1:"",c2:"",c3:""
   };
var turn = 0; //0が先攻”○”,1が後攻"×"
var input = ["○","×"]; //turnにより○か×を選択する　
//var isRun = 0; //ゲーム実行中かの判定　0：not gaming, 1:gaming


exports.index = function(req,res){
    res.render('post/index',{screen:screen});
};

exports.pick = function(req,res){
	var formName =　Object.keys(req.body); //req.bodyから名前だけkey部分を取り出す　{a1:"○"}
	
	if(eval("req.body." + formName)== ""){  //postされたvauleの値（例：re.body.11）がブランクであれば,処理をする
		screen[formName]=input[turn];

		//判定
		if(judge(turn,screen) != ""){
			res.render('post/result',{result:input[turn]});
		}
		
		//ターンの入れ替え	
		if(turn == 0){
			turn=1;
		}else if(turn == 1){
			turn=0;
		}
	}else{　//postされたvauleの値がブランクでなければエラーとする
		console.log("error");
	}
　　　　	
	res.render('post/index',{screen:screen});
};

exports.init = function(req,res){
    //screenの初期化
	for(var key in screen ){
		screen[key]="";
	}
	//turnの初期化
	turn = 0;
	
 	res.render('post/index',{screen:screen});
};

function judge(turn,screen){　//縦のパターン：3,　横のパターン：3,　斜めのパターン：2

var result = "";
//縦パターン
	for(var i = 1; i < 4; i++){
		//縦列が自分のターンの記号(input[turn])と同じならWin! a1=b1=c1=input[turn]
		if(screen[eval("'a"+i+"'")] == input[turn] &&　screen[eval("'b"+i+"'")] == input[turn] && screen[eval("'c"+i+"'")] == input[turn]){
			result = input[turn];
		}
	}
//縦パターン
//横列が自分のターンの記号(input[turn])と同じならWin! a1=a2=a3=input[turn]
	if(screen[eval("'a1'")] == input[turn] &&　screen[eval("'a2'")] == input[turn] && screen[eval("'a3'")] == input[turn] ||
			screen[eval("'b1'")] == input[turn] &&　screen[eval("'b2'")] == input[turn] && screen[eval("'b3'")] == input[turn] ||
				screen[eval("'c1'")] == input[turn] &&　screen[eval("'c2'")] == input[turn] && screen[eval("'c3'")] == input[turn]){
		result = input[turn];
	}
	
//斜めパターン
//斜め列が自分のターンの記号(input[turn])と同じならWin! a1=b2=c3=input[turn]
	if(screen[eval("'a1'")] == input[turn] &&　screen[eval("'b2'")] == input[turn] && screen[eval("'c3'")] == input[turn] ||
			screen[eval("'c1'")] == input[turn] &&　screen[eval("'b2'")] == input[turn] && screen[eval("'a3'")] == input[turn]){

		result = input[turn];	
	}
	
	return result;	
}