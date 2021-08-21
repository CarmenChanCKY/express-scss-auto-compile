var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var scssInitialize = require("./config/scss/scssInitialize.js");
/*
const fileHelper = require("./config/fileHelper.js");
const jsonSetUp = require("./config/json/jsonSetUp.js");
*/
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);


scssInitialize.scssInitialize().then(function (result) {
  console.log(result);
  scssInitialize.setSCSSFileListener();
}).catch(function (e) {
  console.log(e);
});



//let scssDirectoryPath = path.join(__dirname, "public/stylesheets/scss");
//let scssPathArr = fileHelper.getChildFilePath(`${scssDirectoryPath}/**/*.scss`);
/*

let scssJsonObj = {
  updateAllSCSSWhenSave: jsonSetUp.isUpdateAllSCSSWhenSave(),
}

scssJsonObj.scssFileList = jsonSetUp.initializeJSONFileList(scssPathArr);

  console.log(jsonSetUp.reinitializeJSONFileList(scssJsonObj.scssFileList));
*/

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
