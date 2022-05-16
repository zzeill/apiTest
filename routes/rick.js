var express = require('express');
var router = express.Router();

const axios = require('axios');


//GET RANDOM
router.get(['/','/:page'], function(req, res) {

  var data = {};
  data.subTitle = "Rick & Morty Characters!";

  data.page = req.params.page;

  apiCall();

  //API USER VALIDATION
  async function apiCall() {

    let promises = [];
    let result = [];

    //Rick & Morty API
      //IF ANOTHER PAGE REQUESTED
    if(!!data.page) {
      promises.push(apiGet(req.app.locals.config.api.rickApi + req.app.locals.config.api.endpoints.rick.character + "?page=" + data.page));
    }
    else {
      promises.push(apiGet(req.app.locals.config.api.rickApi + req.app.locals.config.api.endpoints.rick.character));
    }
    
    
    const response = await Promise.all(promises);

    response.forEach(item => {
      result = [...result, item.data];
    });

    
    //SUCCESS HANDLER
    if (result.length) {

      data.prev = result[0].info.prev;
      data.next = result[0].info.next;
      data.list = result[0].results;

      if(!!data.prev) {
        data.prev = data.prev.split("=")[1];
      }

      if(!!data.next) {
        data.next = data.next.split("=")[1];
      }

    }
    //ERROR
    else {
      data.error = "Ooops, something went wrong."
    }

    //END
    res.render('rick.ejs', data);


  }

  function apiGet(url) {
    return new Promise((resolve) => {

      (async () => {
        try {
          const resp = await axios.get(url);
          resolve(resp);
        } catch (err) {
          // AXIOS ERROR HANDLER
          //console.log(err);
          resolve(err);
        }
      })();

    });
  }

});

module.exports = router;
