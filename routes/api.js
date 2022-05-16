module.exports = function(app) {

  var userActions = require('../controllers/user.controller.js');

  var favoritesActions = require('../controllers/favorites.controller.js');


  //API PATHs
  var config = app.locals.config;
  var api = config.api;
  var endpoints = config.api.endpoints;

  //API ROUTES

  //API INDEX, LISTS ENDPOINTS
  app.route(api.root)
    .get(function(req,res){res.send({message : "PókeRick API", endpoints : config.api.endpoints})});
  

  //API USER

  //REGISTER
  app.route(api.root + endpoints.user.root  + endpoints.user.register)
    .post(userActions.register);


  //VIEW
  app.route(api.root + endpoints.user.root  + endpoints.user.view)
    .get(userActions.list);


  //UPDATE
  app.route(api.root + endpoints.user.root  + endpoints.user.update +  ':taskId')
    .put(userActions.update)
    .delete(userActions.delete);

    
  //LOGIN
  app.route(api.root + endpoints.user.root  + endpoints.user.login + ':email')
    .get(userActions.findByEmail);


  //FAVORITES SAVE
  app.route(api.root + endpoints.user.root  + endpoints.user.favorites)
  .post(favoritesActions.registerFav);

  app.route(api.root + endpoints.user.root  + endpoints.user.favorites + ':id')
  .get(favoritesActions.listAll);

};