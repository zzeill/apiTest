var express = require('express');
const user = require('../api/models/user.js');
var router = express.Router();

const axios = require('axios');

//FUNCTIONS
var auth = require('../auth.js');

//GET LOG IN
router.get('/login', function(req, res) {

  var data = {};
  data.subTitle = "Log In";

  //IF ALREADY LOGGED IN, GO TO DASHBOARD
  if (!!req.session.user && !!req.session.user.id) {
    res.redirect(req.app.locals.config.urls.root);
  }
  //NOT AUTHENTICATED
  else {
    res.render('user/login', data);
  }

});

//POST LOG IN
router.post('/login', function(req, res) {
  var data = {};
  data.subTitle = "Log In";

  var session = req.session;

  //POST DATA
  data.user = req.body;
  data.user.email = auth.upper(req.body.email); //NORMALIZE UPPERCASE
  data.user.password = auth.notEmpty(req.body.password);

  //VALIDATION
  if(!!data.user.email && data.user.password) {
    //CHECK IF USER EXISTS
    apiCall();

  }


  async function apiCall() {

    let promises = [];
    let result = [];

    promises.push(apiLogin(data.user.email));

    const response = await Promise.all(promises);

    response.forEach(item => {
      //console.log(item);
      result = [...result, item];
    });

    //ONE RESPONSE ONLY
    result = result[0];

    //SUCCESS HANDLER
    if (!result.isAxiosError && result.status == 200 && !!result.data && !result.data.errors && !result.data.code) {

      //EMPTY LIST
      if(!!result.data.empty) {
        data.hideFooter = true;
        data.error = "User not found or incorrect password.";
      }
      else {
        //RESULTS
        //CHECK PASSWORD
        if(auth.checkPass(data.user.password,result.data.password)) {
          //CORRECT
          //SAVE CREDENTIALS
          session.user = {};
          session.user.id = result.data._id;
          session.user.name = result.data.name;
          session.user.lastName = result.data.lastName;
          session.user.email = result.data.email;
          session.user.type = result.data.type[0];
          session.user.profilePhoto = result.data.profilePhoto;
          
          //REDIRECT
          data.messageTitle = "WELCOME BACK "+ session.user.name +"!";
          data.message = "You have logged in succesfully.";
          data.redirect = req.app.locals.config.urls.root;
        }
        else {
          //WRONG PASSWORD
          data.hideFooter = true;
          data.error = "Incorrect user or password.";
        }
        
        
      }
      
    }
    //API ERROR HANDLER
    else if (!!result.data && !!result.data.errors) {

      if (req.app.get('env').trim() == "development") {
        //DEV
        data.error = Object.entries(result.data.errors);

        data.error.forEach((item, index) => {
          item[0] = item[0].toUpperCase();
          item[1] = JSON.stringify(item[1].message).replaceAll('"', '');

          data.error[index] = item.join(' : ');
        });

        data.error = data.error.join(' | ');

      }
      else {
        //PRODUCTION
        data.error = auth.upper(result.data._message);
      }


    }
    //API EXCEPTION CODE HANDLER
    else if (!!result.data && !!result.data.code) {

      switch (result.data.code) {

        case 11000:
          data.error = "Email already in use.";
          break;
        default:
          data.error = "Ooops, something went wrong.";

      }

    }
    //AXIOS ERROR
    else if (result.isAxiosError) {
      data.error = result.response.status + " " + result.response.statusText;
    }
    //UNKNOWN ERROR HANDLER
    else {
      data.error = "Ooops, something went wrong."
    }

    //SUCCESS
    if (!data.error) {
      res.render('message', data)
    }
    //FAIL
    else {
      res.render('user/login', data)
    }


  }

  function apiLogin(item) {
    return new Promise((resolve) => {

      (async () => {
        try {
          const resp = await axios.get(req.app.locals.config.api.api + req.app.locals.config.api.endpoints.user.root + req.app.locals.config.api.endpoints.user.login + item);
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


//GET LOG OUT
router.get('/logout', function(req, res) {

  var data = {};
  data.subTitle = "Log Out";

  if (!!req.session.user) {

    req.session.destroy();

    data.messageTitle = "You've been logged out";
    data.message = "Thanks for using this website.";
    data.redirect = req.app.locals.config.urls.root;

    res.render('message', data);

  }
  else {
    res.redirect(req.app.locals.config.paths.rootUsers + req.app.locals.config.paths.login + '/');
  }



});


//GET REGISTER
router.get('/register', function(req, res) {
  var data = {};
  data.subTitle = "Sign Up";

  res.render('user/register', data);
});

//POST REGISTER
router.post('/register', function(req, res) {
  var data = {};
  data.subTitle = "Sign Up";

  //POST DATA
  data.user = req.body;

  //BACKEND VALIDATION
  (async () => {

    if (!!data.user.terms) {
      delete data.user.terms;
    }
    else {
      data.error = "You must accept the terms of service.";
    }

    //NORMALIZE USER INPUT
    for (let item in data.user) {

      if(item != 'password1' && item != 'password2') { //SKIP PASSWORD
        data.user[item] = auth.upper(data.user[item]);
      }
      else {
        //CHECK PASSWORD ISN'T EMPTY
        data.user[item] = auth.notEmpty(data.user[item]);
      }
      
    }

    if(data.user.name && data.user.lastName && data.user.email && data.user.password1 && data.user.password2) {
      //DATA OK
      //PASSWORD VERIFICATION
      if(data.user.password1 === data.user.password2 && (data.user.password1.length >= 8) && (/\d/.test(data.user.password1)) && (/[a-z]/i.test(data.user.password1))) {
        //PASSWORD MEETS SECURITY CRITERIA
        data.user.password = auth.encryptPass(data.user.password1);
        delete data.user.password1;
        delete data.user.password2;
      }
      else {
        //PASSWORD DON'T MEETS SECURITY CRITERIA
        data.error = "Passwords must be the same, be at least 8 characters long and have a number and a letter."
      }
      
    }
    else {
      //MISSING DATA
      data.error = "All fields are required.";
    }

  })().then(
    function(){
      
      if(!data.error){
      
        apiCall();       

        data.messageTitle = "Account Created!";
        data.message = "Your account has been successfully created.";

      }
      else {
        //ERROR
        res.render('user/register', data)
      }
    }
  );


  async function apiCall() {

    let promises = [];
    let result = [];

    promises.push(apiRegister(data.user));

    const response = await Promise.all(promises);

    response.forEach(item => {
      //console.log(item);
      result = [...result, item];
    });

    //ONE RESPONSE ONLY
    result = result[0];

    //SUCCESS HANDLER
    if(!result.isAxiosError && result.status == 200 && !!result.data && !result.data.errors && !result.data.code) {
      data.redirect = req.app.locals.config.paths.rootUsers + req.app.locals.config.paths.login;
      //SESSION
      req.session.user = {};
      req.session.user.id = result.data._id;
      req.session.user.name = result.data.name;
      req.session.user.lastName = result.data.lastName;
      req.session.user.email = result.data.email;
      req.session.user.type = result.data.type[0];
      req.session.user.profilePhoto = result.data.profilePhoto;
      req.session.save();
    }
    //API ERROR HANDLER
    else if(!!result.data && !!result.data.errors) {
      
      if(req.app.get('env').trim() == "development") {
        //DEV
        data.error = Object.entries(result.data.errors);

        data.error.forEach((item, index) => {
          item[0] = item[0].toUpperCase();
          item[1] = JSON.stringify(item[1].message).replaceAll('"','');

          data.error[index] = item.join(' : ');
        });

        data.error = data.error.join(' | ');
        
      }
      else {
        //PRODUCTION
        data.error = auth.upper(result.data._message);
      }
      

    }
    //API EXCEPTION CODE HANDLER
    else if(!!result.data && !!result.data.code) {

      switch(result.data.code) {

        case 11000:
          data.error = "Email already in use.";
          break;
        default:
          data.error = "Ooops, something went wrong.";

      }

    }
    //AXIOS ERROR
    else if(result.isAxiosError) {
      data.error = result.response.status + " " + result.response.statusText;
    }
    //UNKNOWN ERROR HANDLER
    else {
      data.error = "Ooops, something went wrong."
    }

    //SUCCESS
    if(!data.error) {
      res.render('message', data)
    }
    //FAIL
    else {
      res.render('user/register', data)
    }
    

  }

  function apiRegister(item) {
    return new Promise((resolve) => {

      (async () => {
        try {
          const resp = await axios.post(req.app.locals.config.api.api + req.app.locals.config.api.endpoints.user.root + req.app.locals.config.api.endpoints.user.register, item);
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


//GET PROFILE
router.get('/profile', function(req, res) {

  var data = {};
  data.subTitle = "Profile";
  userId = req.session.user.id;

  apiCall();

  //API VALIDATION
  async function apiCall() {

    let promises = [];
    let result = [];

    promises.push(apiFav());

    const response = await Promise.all(promises);

    response.forEach(item => {
      result = [...result, item];
    });

    //SINGLE RESPONSE
    result = result[0];

    //SUCCESS HANDLER
    if (!result.isAxiosError && result.status == 200 && !!result.data && !result.data.errors && !result.data.code) {

      //EMPTY LIST
      if(!!result.data.empty) {
        data.hideFooter = true;
        data.error = "There is no data.";
      }
      else {
        //RESULTS
        data.list = result.data;
        
      }
      
    }
    //API ERROR HANDLER
    else if (!!result.data && !!result.data.errors) {

      if (req.app.get('env').trim() == "development") {
        //DEV
        data.error = Object.entries(result.data.errors);

        data.error.forEach((item, index) => {
          item[0] = item[0].toUpperCase();
          item[1] = JSON.stringify(item[1].message).replaceAll('"', '');

          data.error[index] = item.join(' : ');
        });

        data.error = data.error.join(' | ');

      }
      else {
        //PRODUCTION
        data.error = auth.upper(result.data._message);
      }


    }
    //API EXCEPTION CODE HANDLER
    else if (!!result.data && !!result.data.code) {

      switch (result.data.code) {

        case 11000:
          data.error = "Email already in use.";
          break;
        default:
          data.error = "Ooops, something went wrong.";

      }

    }
    //AXIOS ERROR
    else if (result.isAxiosError) {
      data.error = result.response.status + " " + result.response.statusText;
    }
    //UNKNOWN ERROR HANDLER
    else {
      data.error = "Ooops, something went wrong."
    }
    
    if (!data.error) {

      promises = [];
      data.list.forEach(item => {

        if (item.serie == "rick") {
          //Rick & Morty API
          promises.push(apiGet(req.app.locals.config.api.rickApi + req.app.locals.config.api.endpoints.rick.character + item.idChar));

        }
        else {
          //POKEMON API
          promises.push(apiGet(req.app.locals.config.api.pokeApi + req.app.locals.config.api.endpoints.poke.pokemon + item.idChar));
        }
      });

      const response = await Promise.all(promises);

      result = [];

      response.forEach(item => {
        result = [...result, item.data];
      });

      data.list = result;

      if(data.list.length == 0) {

          //EMPTY LIST
          data.message = "You haven't added any character to your favorites.";

      }
      
    }

    //SUCCESS
    console.log(data);
    res.render('user/profile', data);


  }

  //GENERIC GET
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

  function apiFav() {
    return new Promise((resolve) => {

      (async () => {
        try {
          const resp = await axios.get(req.app.locals.config.api.api + req.app.locals.config.api.endpoints.user.root + req.app.locals.config.api.endpoints.user.favorites + userId);
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


//POST PROFILE
router.post('/profile', function(req, res) {

  res.setHeader('Content-Type', 'application/json');

  var data = {};
  data.subTitle = "Profile";

  //POST DATA
  data.user = {};
  data.user.name = auth.upper(req.body.name);
  data.user.lastName = auth.upper(req.body.lastName);
  data.user.currentPass = auth.notEmpty(req.body.currentPass);
  data.user.newPass1 = auth.notEmpty(req.body.newPass1);
  data.user.newPass2 = auth.notEmpty(req.body.newPass2);
  data.user.id = req.session.user.id;
  data.user.email = req.session.user.email;

  apiCall();

  //API USER VALIDATION
  async function apiCall() {

    let promises = [];
    let result = [];

    promises.push(apiLogin(data.user.email));

    const response = await Promise.all(promises);

    response.forEach(item => {
      result = [...result, item];
    });

    //ONE RESPONSE ONLY
    result = result[0];

    //SUCCESS HANDLER
    if (!result.isAxiosError && result.status == 200 && !!result.data && !result.data.errors && !result.data.code) {

      //EMPTY LIST
      if(!!result.data.empty) {
        data.hideFooter = true;
        data.error = "User not found.";
      }
      else {
        //RESULTS
        //CHECK IF CHANGE OF PASSWORD
        if (data.user.currentPass && data.user.newPass1 && data.user.newPass2 && data.user.newPass1 === data.user.newPass2) {

          if (auth.checkPass(data.user.currentPass, result.data.password)) {
            //CORRECT
            //PASSWORD VERIFICATION
            if ((data.user.newPass1.length >= 8) && (/\d/.test(data.user.newPass1)) && (/[a-z]/i.test(data.user.newPass1))) {
              //PASSWORD MEETS SECURITY CRITERIA
              data.user.password = auth.encryptPass(data.user.newPass1);
              delete data.user.currentPass;
              delete data.user.newPass1;
              delete data.user.newPass2;
            }
            else {
              //PASSWORD DON'T MEETS SECURITY CRITERIA
              data.error = "Passwords must be the same, be at least 8 characters long and have a number and a letter."
            }
            
          }
          else {
            //WRONG PASSWORD
            data.hideFooter = true;
            data.error = "Incorrect user or password.";
          }

        }
        
        if(!data.error) {
          updateCall();
        }

      }
      
    }
    //API ERROR HANDLER
    else if (!!result.data && !!result.data.errors) {

      if (req.app.get('env').trim() == "development") {
        //DEV
        data.error = Object.entries(result.data.errors);

        data.error.forEach((item, index) => {
          item[0] = item[0].toUpperCase();
          item[1] = JSON.stringify(item[1].message).replaceAll('"', '');

          data.error[index] = item.join(' : ');
        });

        data.error = data.error.join(' | ');

      }
      else {
        //PRODUCTION
        data.error = auth.upper(result.data._message);
      }


    }
    //API EXCEPTION CODE HANDLER
    else if (!!result.data && !!result.data.code) {

      switch (result.data.code) {

        case 11000:
          data.error = "Email already in use.";
          break;
        default:
          data.error = "Ooops, something went wrong.";

      }

    }
    //AXIOS ERROR
    else if (result.isAxiosError) {
      data.error = result.response.status + " " + result.response.statusText;
    }
    //UNKNOWN ERROR HANDLER
    else {
      data.error = "Ooops, something went wrong."
    }


    //FAIL
    if (data.error) {
      res.status(400).end(JSON.stringify({ error: data.error }));
    }


  }


  //API UPDATE
  async function updateCall() {

    let promises = [];
    let result = [];

    promises.push(apiUpdate(data.user));

    const response = await Promise.all(promises);

    response.forEach(item => {
      result = [...result, item];
    });

    //ONE RESPONSE ONLY
    result = result[0];

    //SUCCESS HANDLER
    if (!result.isAxiosError && result.status == 200 && !!result.data && !result.data.errors && !result.data.code) {

      
      //EMPTY LIST
      if(!!result.data.empty) {
        data.hideFooter = true;
        data.error = "User not found.";
      }
      else {
        //SESSION UPDATE  
        req.session.user = {};
        req.session.user.id = result.data._id;
        req.session.user.name = result.data.name;
        req.session.user.lastName = result.data.lastName;
        req.session.user.email = result.data.email;
        req.session.user.type = result.data.type[0];
        req.session.user.profilePhoto = result.data.profilePhoto;

        req.session.save();

        data.message = "Profile updated successfully."
      }
      
    }
    //API ERROR HANDLER
    else if (!!result.data && !!result.data.errors) {

      if (req.app.get('env').trim() == "development") {
        //DEV
        data.error = Object.entries(result.data.errors);

        data.error.forEach((item, index) => {
          item[0] = item[0].toUpperCase();
          item[1] = JSON.stringify(item[1].message).replaceAll('"', '');

          data.error[index] = item.join(' : ');
        });

        data.error = data.error.join(' | ');

      }
      else {
        //PRODUCTION
        data.error = auth.upper(result.data._message);
      }


    }
    //API EXCEPTION CODE HANDLER
    else if (!!result.data && !!result.data.code) {

      switch (result.data.code) {

        case 11000:
          data.error = "Email already in use.";
          break;
        default:
          data.error = "Ooops, something went wrong.";

      }

    }
    //AXIOS ERROR
    else if (result.isAxiosError) {
      data.error = result.response.status + " " + result.response.statusText;
    }
    //UNKNOWN ERROR HANDLER
    else {
      data.error = "Ooops, something went wrong."
    }

    //SUCCESS
    if (!data.error) {
      res.status(200).end(JSON.stringify({ message: data.message }));
    }
    //FAIL
    else {
      res.status(400).end(JSON.stringify({ error: data.error }));
    }

  }


  function apiUpdate(item) {
    return new Promise((resolve) => {

      (async () => {
        try {
          const resp = await axios.put(req.app.locals.config.api.api + req.app.locals.config.api.endpoints.user.root + req.app.locals.config.api.endpoints.user.update + item.id, item);
          resolve(resp);
        } catch (err) {
          // AXIOS ERROR HANDLER
          //console.log(err);
          resolve(err);
        }
      })();

    });
  }


  function apiLogin(item) {
    return new Promise((resolve) => {

      (async () => {
        try {
          const resp = await axios.get(req.app.locals.config.api.api + req.app.locals.config.api.endpoints.user.root + req.app.locals.config.api.endpoints.user.login + item);
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


//POST DELETE
router.post('/delete', function(req, res) {

  res.setHeader('Content-Type', 'application/json');

  var data = {};

  //POST DATA
  data.user = {};
  data.user.id = req.session.user.id;

  apiCall();

  //API USER VALIDATION
  async function apiCall() {

    let promises = [];
    let result = [];

    promises.push(apiDelete(data.user.id));

    const response = await Promise.all(promises);

    response.forEach(item => {
      result = [...result, item];
    });

    //ONE RESPONSE ONLY
    result = result[0];

    //SUCCESS HANDLER
    if (!result.isAxiosError && result.status == 200 && !!result.data && !result.data.errors && !result.data.code) {

      //EMPTY LIST
      if(!!result.data.empty) {
        data.hideFooter = true;
        data.error = "User not found.";
      }
      else {
        //RESULTS
        data.message = result.data.message;
      }
      
    }
    //API ERROR HANDLER
    else if (!!result.data && !!result.data.errors) {

      if (req.app.get('env').trim() == "development") {
        //DEV
        data.error = Object.entries(result.data.errors);

        data.error.forEach((item, index) => {
          item[0] = item[0].toUpperCase();
          item[1] = JSON.stringify(item[1].message).replaceAll('"', '');

          data.error[index] = item.join(' : ');
        });

        data.error = data.error.join(' | ');

      }
      else {
        //PRODUCTION
        data.error = auth.upper(result.data._message);
      }


    }
    //API EXCEPTION CODE HANDLER
    else if (!!result.data && !!result.data.code) {

      switch (result.data.code) {

        case 11000:
          data.error = "Email already in use.";
          break;
        default:
          data.error = "Ooops, something went wrong.";

      }

    }
    //AXIOS ERROR
    else if (result.isAxiosError) {
      data.error = result.response.status + " " + result.response.statusText;
    }
    //UNKNOWN ERROR HANDLER
    else {
      data.error = "Ooops, something went wrong."
    }

    //SUCCESS
    if (!data.error) {
      req.session.destroy();
      res.status(200).end(JSON.stringify({ message: data.message }));
    }
    //FAIL
    else {
      res.status(400).end(JSON.stringify({ error: data.error }));
    }


  }

  function apiDelete(item) {
    return new Promise((resolve) => {

      (async () => {
        try {
          const resp = await axios.delete(req.app.locals.config.api.api + req.app.locals.config.api.endpoints.user.root + req.app.locals.config.api.endpoints.user.update + item);
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


//GET LIST
router.get('/list', function(req, res) {

  var data = {};
  data.subTitle = "Users List";

  apiCall();

  //API USER VALIDATION
  async function apiCall() {

    let promises = [];
    let result = [];

    promises.push(apiList());

    const response = await Promise.all(promises);

    response.forEach(item => {
      result = [...result, item];
    });

    //SINGLE RESPONSE
    result = result[0];

    //SUCCESS HANDLER
    if (!result.isAxiosError && result.status == 200 && !!result.data && !result.data.errors && !result.data.code) {

      //EMPTY LIST
      if(!!result.data.empty) {
        data.hideFooter = true;
        data.error = "There is no data.";
      }
      else {
        //RESULTS
        data.list = result.data;
      }
      
    }
    //API ERROR HANDLER
    else if (!!result.data && !!result.data.errors) {

      if (req.app.get('env').trim() == "development") {
        //DEV
        data.error = Object.entries(result.data.errors);

        data.error.forEach((item, index) => {
          item[0] = item[0].toUpperCase();
          item[1] = JSON.stringify(item[1].message).replaceAll('"', '');

          data.error[index] = item.join(' : ');
        });

        data.error = data.error.join(' | ');

      }
      else {
        //PRODUCTION
        data.error = auth.upper(result.data._message);
      }


    }
    //API EXCEPTION CODE HANDLER
    else if (!!result.data && !!result.data.code) {

      switch (result.data.code) {

        case 11000:
          data.error = "Email already in use.";
          break;
        default:
          data.error = "Ooops, something went wrong.";

      }

    }
    //AXIOS ERROR
    else if (result.isAxiosError) {
      data.error = result.response.status + " " + result.response.statusText;
    }
    //UNKNOWN ERROR HANDLER
    else {
      data.error = "Ooops, something went wrong."
    }

    //END
    res.render('user/list', data);


  }

  function apiList() {
    return new Promise((resolve) => {

      (async () => {
        try {
          const resp = await axios.get(req.app.locals.config.api.api + req.app.locals.config.api.endpoints.user.root + req.app.locals.config.api.endpoints.user.view);
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



//POST FAVORITES
router.post('/favorites', function(req, res) {

  res.setHeader('Content-Type', 'application/json');

  var data = {};
  data.fav = req.body;
  data.fav.id = req.session.user.id;

  apiCall();

  //API VALIDATION
  async function apiCall() {

    let promises = [];
    let result = [];

    promises.push(apiFav());

    const response = await Promise.all(promises);

    response.forEach(item => {
      result = [...result, item];
    });

    //SINGLE RESPONSE
    result = result[0];

    //SUCCESS HANDLER
    if (!result.isAxiosError && result.status == 200 && !!result.data && !result.data.errors && !result.data.code) {

      //EMPTY LIST
      if(!!result.data.empty) {
        data.hideFooter = true;
        data.error = "There is no data.";
      }
      else {
        //RESULTS
        data.message = "Character added to your favorites.";
        
      }
      
    }
    //API ERROR HANDLER
    else if (!!result.data && !!result.data.errors) {

      if (req.app.get('env').trim() == "development") {
        //DEV
        data.error = Object.entries(result.data.errors);

        data.error.forEach((item, index) => {
          item[0] = item[0].toUpperCase();
          item[1] = JSON.stringify(item[1].message).replaceAll('"', '');

          data.error[index] = item.join(' : ');
        });

        data.error = data.error.join(' | ');

      }
      else {
        //PRODUCTION
        data.error = auth.upper(result.data._message);
      }


    }
    //API EXCEPTION CODE HANDLER
    else if (!!result.data && !!result.data.code) {

      switch (result.data.code) {

        case 11000:
          data.error = "Email already in use.";
          break;
        default:
          data.error = "Ooops, something went wrong.";

      }

    }
    //AXIOS ERROR
    else if (result.isAxiosError) {
      data.error = result.response.status + " " + result.response.statusText;
    }
    //UNKNOWN ERROR HANDLER
    else {
      data.error = "Ooops, something went wrong."
    }

    //SUCCESS
    if (!data.error) {
      res.status(200).end(JSON.stringify({ message: data.message }));
    }
    //FAIL
    else {
      res.status(400).end(JSON.stringify({ error: data.error }));
    }


  }

  function apiFav() {
    return new Promise((resolve) => {

      (async () => {
        try {
          const resp = await axios.post(req.app.locals.config.api.api + req.app.locals.config.api.endpoints.user.root + req.app.locals.config.api.endpoints.user.favorites, data.fav);
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
