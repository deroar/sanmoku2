exports.index = function(req, res) {

  console.log("sanmoku.index--");
  console.log("room : " + req.query.rooms);
  console.log("name : " + req.query.name);

  res.render('sanmoku/game', {
    room : req.query.rooms,
    username : req.query.name
  });
};