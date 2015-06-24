exports.index = function(req,res){
	var name = req.body.name;
	req.session.name = req.body.name;
	res.render('room/room',{name:name});
};
