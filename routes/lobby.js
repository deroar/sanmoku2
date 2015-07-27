exports.index = function(req,res){
  console.log("lobby.js--start--");
  var name = req.body.name;
  res.render('lobby/lobby',{name:name});
};
