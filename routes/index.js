var model = require('../model.js'), User = model.User;

/* ログイン後ページ */
exports.index = function(req, res) {

  console.log(req.session);
//  res.render('lobby/lobby', {name : req.session.user});
  res.render('login');
};

/* ログイン機能 */
exports.login = function(req, res) {

  console.log("index.login--start-- >> " + req.query.name);

  var name = req.query.name;
  var query = {
    "name" : name,
  };

  User.find(query, function(err, data) {

    console.log("login: data >> " + data);

    if (err) {
      console.log(err);
    }

    if (data == "") {
      console.log("No User in DB");

      var newUser = new User(req.body);
      newUser['name'] = name;
      newUser['logNum'] = 1;
      newUser['rankP'] = 0;

      console.log("登録前情報>>\n" + newUser);

      if (newUser['name']) {
        newUser.save(function(err) {
          if (err) {
            console.log(err);
          } else {
              res.render('lobby/lobby', { name : req.query.name });
          }
        });
      }else{
        console.log("Error: No name");
        res.render('login');
      }

    } else {
      req.session.user = name;
      req.session.logNum = data[0].logNum;

      // ログイン回数をプラスする
      User.update(query, {
        $inc : {
          logNum : 1
        }
      }, function(err) {
        if (err) {
          console.log("logNum Update error");
        } else {
            res.render('lobby/lobby', { name : req.query.name });
        }
      });
    }
  });
};

/* ユーザー登録機能 */
exports.add = function(req, res) {
  var newUser = new User(req.body);
  newUser['logNum'] = 0;
  newUser['rankP'] = 0;
  console.log("newUser >> " + newUser);

  User.find({
    name : req.body.name
  }, function(err, data) {
    if (err) {
      console.log(err);
    }
    console.log("add: data >> " + data);

    if (data == "") {
      newUser.save(function(err) {
        if (err) {
          console.log(err);
          res.redirect('back');
        } else {
          res.redirect('/');
        }
      });

    } else {
      console.log("save error");
      res.redirect('/');
    }
  });
};