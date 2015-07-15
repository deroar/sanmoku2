var model = require('../model.js'), User = model.User;

/* ログイン後ページ */
exports.index = function(req, res) {

	console.log(req.session);

	res.render('room/room', {
		name : req.session.user,
		logNum : req.session.logNum
	});
};

/* ユーザー登録機能 */
exports.add = function(req, res) {
	var newUser = new User(req.body);
	newUser['logNum'] = 0;
	newUser['rankP'] = 0;
	console.log("newUser >> " + newUser);

	console.log("email >> " + req.body.name);

	User.find({name:req.body.name},function(err,data){
		if (err) {
			console.log(err);
		}
		if (data == "") {
			newUser.save(function(err) {
				if (err) {
					console.log(err);
					res.redirect('back');
				} else {
					res.redirect('/');
				}
			});

		}else{
			console.log("すでに登録されています");
			res.redirect('/');
		}
	});
};

/* ログイン機能 */
exports.login = function(req, res) {

	var name = req.query.name;
	var query = {
		"name" : name,
	};

	User.find(query,function(err, data) {

		if (err) {
			console.log(err);
		}
		if (data == "") {
			console.log("No User in DB");
			res.render('login');
		} else {

			req.session.user = name;
			req.session.logNum = data[0].logNum;

			//ログイン回数をプラスする
			User.update(query,{$inc:{logNum:1}},function(err){
				if(err){
					console.log("logNum Update error");
				}
			});

			res.redirect('/');
		}
	});
};