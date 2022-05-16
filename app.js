var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');

//ROUTES FOLDERS
var allRouter = require('./routes/all');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var randomRouter = require('./routes/random');
var rickRouter = require('./routes/rick');
var routes = require('./routes/api');

//DATABASE
mongoose = require('mongoose');
Task = require('./api/models/user');
Fav = require('./api/models/favorites');

//DB CONNECT
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1/fenderTest').then(() => {
  console.log("Connected to Database");
}).catch((err) => {
  console.log("Unable to connect to Database! ", err);
});

//SESSION
const session = require('express-session');
const MongoStore = require('connect-mongo');

//CONFIG
var cnf = require('./config');

var app = express();

//Settings Variables
app.locals.config = cnf;

//SESSION
app.use(
  session({
      secret: 'FenderSecurityString',
      resave: false,
      saveUninitialized: false,
      rolling: true,
      store: MongoStore.create({
           mongoUrl: 'mongodb://127.0.0.1:27017/node-session-fender'
      }),
      //2 HOUR SESSION
      ttl: 2 * 60 * 60,
      cookie: { expires: new Date(2 * 60 * 60 * 1000), maxAge: 2 * 60 * 60 * 1000 }
  })
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//ROUTES
app.use('*', allRouter);
app.use('/', indexRouter);
app.use('/rickAndMorty', rickRouter);
app.use('/users', usersRouter);
app.use('/random', randomRouter);

//API ROUTES
routes(app);

//BODY PARSER
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env').trim() === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
