var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var scssSetUp = require("./config/scss/scssSetUp.js");

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
/*
console.log(scssSetUp.checkCSSFolderExist(path.join(__dirname, 'public/stylesheets/scss')));
console.log(path.join(__dirname, 'public/stylesheets/scss'));
*/

let cssFolderPath = path.join(__dirname, "public/stylesheets/css");
let scssFolderPath = path.join(__dirname, "public/stylesheets/scss");

if (scssSetUp.checkFolderExist(cssFolderPath)) {
} else {
  let scssFileArr = scssSetUp.getChildFilePath(`${scssFolderPath}/**/!(_)*.scss`);

  if (scssFileArr.length >= 1) {

    let scssFolderArr = scssSetUp.getChildFolderPath(
      `${scssFolderPath}/**/!(*.scss)`
    );

    if (scssFolderArr.length >= 1) {
      scssFolderArr.splice(0, 0, cssFolderPath);
      let directoryNameFilterCondition = [["/scss/", "/css/"]];
      let fileNameFilterCondition = [["/scss/", "/css/"], [".scss", ".css"]];

      scssSetUp.createDirectoryAsync(scssFolderArr, directoryNameFilterCondition).then(function () {
        scssSetUp.createFileAsync(scssFileArr, fileNameFilterCondition, false).catch(function (error) {
          console.log(error);
        });
      }).catch(function (err) {
        console.log(err);
      });

    }
  } else {
    console.log("No styles found!");
  }
}

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
