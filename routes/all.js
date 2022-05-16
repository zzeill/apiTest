var express = require('express');
var router = express.Router();

//ALL REQUESTS GENERAL VARIABLES
const restrict = function (req, res, next) {

  console.log("ALL REQUESTS//");
  //WEBSITE TITLE
  res.locals.mainTitle = req.app.locals.config.mainTitle;

  //PAGES NOT BLOCKED
  var noUserPages = ["/random", "/logout", "/api", "/users/register", "/users/login"];
  var webExtensions = [".css", ".js", ".png", ".jpg" , ".gif"];

  let search = (string, allowList) => 
        allowList.some(el => string.includes(el));

  if(search(req.originalUrl, webExtensions)){
    //LET IMAGES, CSS, ETC. THROUGH
  }
  //BLOCK NON ESSENCIAL PAGES IF USER NOT LOGGED IN
  else if (!req.session.user && !search(req.originalUrl, noUserPages) && !(req.originalUrl == "/")) {
      return res.status(403).send('Please <a href="/users/login">log in</a>.');
  }

  //SESSION REFRESH
  if(!!req.session) {

    //USER INFO
    if (!!req.session.user) {
      res.locals.credentials = req.session.user;
    }

    req.session.touch();

  }

  next();

}

//GET / POST
router.get('*', restrict);
router.post('*', restrict);
router.put('*', restrict);
router.delete('*', restrict);

module.exports = router;
