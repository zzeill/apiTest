var mongoose = require('mongoose');

Task = mongoose.model('user');

exports.list = function (req, res) {

  Task.find({}, function (err, task) {

    if(task === null) {
      res.json({empty : true  });
    }
    else {
      res.json(task);
    }

  });

};

exports.register = function (req, res) {

  var new_user = new Task(req.body);

  new_user.save(function (err, task) {

    if (err) {
      res.send(err);
    }
    else {
      res.json(task);
    }

  });

};

exports.findById = function (req, res) {

  Task.findById(req.params.taskId, function (err, task) {

    if (err) {
      res.send(err);
    }
    else {
      res.json(task);
    }

  });

};

exports.findByEmail = function (req, res) {

  Task.findOne({ email: req.params.email }, function (err, task) {

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

exports.update = function (req, res) {
  Task.findByIdAndUpdate({ _id: req.params.taskId }, req.body, { new: true }, function (err, task) {
    if (err) {
      res.send(err);
    }
    else {
      res.json(task);
    }
  });
};


exports.delete = function (req, res) {

  console.log(req.params.taskId);

  Task.remove({
    _id: req.params.taskId
  }, function (err, task) {

    if (err) {
      res.send(err);
    }
    else {
      res.json({ message: 'Account successfully deleted.' });
    }

  });
};