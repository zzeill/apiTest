var mongoose = require('mongoose');

Fav = mongoose.model('favorites');

exports.listAll = function (req, res) {

  Fav.find({ id: req.params.id }, function (err, task) {

    if (err) {
      res.send(err);
    }
    else {

      if(task === null) {
        res.json({empty : true  });
      }
      else {
        res.json(task);
      }
    }   

  });

};


exports.registerFav = function (req, res) {

  var new_fav = new Fav(req.body);

  new_fav.save(function (err, task) {

    if (err) {
      res.send(err);
    }
    else {
      res.json(task);
    }

  });

};
