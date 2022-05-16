var express = require('express');
var router = express.Router();

const axios = require('axios');


//GET RANDOM
router.get('/', function(req, res) {

  var data = {};
  data.subTitle = "Random!";

  apiCall();

  //API USER VALIDATION
  async function apiCall() {

    let promises = [];
    let result = [];

    //Rick & Morty API
    promises.push(apiGet(req.app.locals.config.api.rickApi + req.app.locals.config.api.endpoints.rick.character));
    
    //Pókemon API
    promises.push(apiGet(req.app.locals.config.api.pokeApi + req.app.locals.config.api.endpoints.poke.pokemon));

    const response = await Promise.all(promises);

    response.forEach(item => {
      //COUNT INFO
      if(item.data && item.data.count) {
        data.pokemon = item.data.count;
      }
      else if(item.data && item.data.info && item.data.info.count) {
        data.rick = item.data.info.count;
      }
      result = [...result, item];
    });


    
    //SUCCESS HANDLER
    if (data.pokemon && data.rick) {

      //GET RANDOM NUMBER BASED IN TOTAL CHARACTERS
      data.randomRick = Math.floor(Math.random() * ((data.rick+1) - 1) + 1); //MAX IS EXCLUSIVE, +1 TO FIX IT
      data.randomPoke = Math.floor(Math.random() * ((908 +1) - 1) + 1); //API RETURNS A RANDOM COUNT BECAUSE EXTRA EVOLUTIONS, HARDCODING THE REAL ONE

      //GET RANDOM CHARACTERS
      promises = []; //CLEAR PROMISES
      //Rick & Morty API
      promises.push(apiGet(req.app.locals.config.api.rickApi + req.app.locals.config.api.endpoints.rick.character + data.randomRick));
      //Pókemon API
      promises.push(apiGet(req.app.locals.config.api.pokeApi + req.app.locals.config.api.endpoints.poke.pokemon + data.randomPoke));

      const response = await Promise.all(promises);

      result = [];

      response.forEach(item => {
        result = [...result, item.data];
      });


      //SUCCESS
      if(result.length == 2) {
        data.list = result;
      }
      //ERROR
      else {
        data.message = "Ooops, couldn't communicate with the API.";
      }
  

    }
    //ERROR
    else {
      data.error = "Ooops, something went wrong."
    }

    //END
    res.render('random.ejs', data);


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
