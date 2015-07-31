exports.index = function(req, res) {

  console.log("sanmoku.index--");
  console.log("room : " + req.query.room);
  console.log("name : " + req.query.name);

  res.render('sanmoku/game', {
    room : req.query.room,
    username : req.query.name
  });
};