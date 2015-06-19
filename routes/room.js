exports.index = function(req,res){
	var name = req.body.name;
	
    res.render('room/room',{name:name});
};
