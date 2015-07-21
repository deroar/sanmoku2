exports.index = function(req, res) {

	res.render('sanmoku/game', {
		username : req.query.name,
	});
};