var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require("cors");
const bodyParser = require("body-parser");

// Importation des routers
var indexRouter = require('./routes/index');
const adminRoutes = require("./routes/Admin");
const niveauRoutes = require("./routes/Niveau");
const eleveRoutes = require("./routes/Eleve");
const professeurRoutes = require("./routes/Professeur");

var app = express();

/* database connection */
require("./config/database");

app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Definition des routes
app.use('/Projet_Assignement', indexRouter);
app.use('/Projet_Assignement/Admin', adminRoutes);
app.use('/Projet_Assignement/Niveau', niveauRoutes);
app.use('/Projet_Assignement/Eleve', eleveRoutes);
app.use('/Projet_Assignement/Professeur', professeurRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
