exports.index = function(req,res){
	console.log("req >> " + req.body);
	var name = req.body.name;
	res.render('room/room',{name:name});
};
