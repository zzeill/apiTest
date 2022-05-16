var express = require('express');
var router = express.Router();

//GET INDEX
router.get('/', function(req, res) {
  var data = {};
  data.subTitle = "Welcome!"

  if(!!req.session.user) {
    res.render('dashboard', data);
  }
  else {
    res.render('index', data);
  }
});

module.exports = router;
