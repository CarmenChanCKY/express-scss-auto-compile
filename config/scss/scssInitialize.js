const path = require("path");
const chokidar = require('chokidar');
const sass = require("sass");
const fileHelper = require("../fileHelper.js");
const jsonSetUp = require("../json/jsonSetUp.js");

let cssDirectoryPath = path.join(__dirname, "../../public/stylesheets/css");
let scssDirectoryPath = path.join(__dirname, "../../public/stylesheets/scss");
let scssJsonFilePath = jsonSetUp.getJsonFilePath();

let directoryNameFilterCondition = [["/scss/", "/css/"]];
let fileNameFilterCondition = [
  ["/scss/", "/css/"],
  [".scss", ".css"],
];

function scssForProduction() {
  scssInitialize()
    .then(function (result) {
      console.log(`Production: ${result}`)
    })
    .catch(function (e) {
      console.log(`Production Fail: ${e}`);
    });
}

async function scssInitialize() {
  try {

    if (fileHelper.checkExistence(cssDirectoryPath)) {
      await fileHelper.removeDirectoryAsync(cssDirectoryPath);
    }

    let scssFileArr = fileHelper.getChildFilePath(`${scssDirectoryPath}/**/!(_)*.scss`);

    if (scssFileArr.length >= 1) {
      let scssDirectoryArr = fileHelper.getChildDirectoryPath(
        `${scssDirectoryPath}/**/!(*.scss)`
      );
      scssDirectoryArr.splice(0, 0, cssDirectoryPath);

      let contentArr = [];
      // TODO: development or production
      contentArr = scssFileArr.map(function (path) {
        return translateToCSS(path, false);
      })

      await fileHelper.createDirectoryAsync(scssDirectoryArr, directoryNameFilterCondition);
      await fileHelper.createFileAsync(scssFileArr, contentArr, fileNameFilterCondition);

      let scssPathArr = fileHelper.getChildFilePath(`${scssDirectoryPath}/**/*.scss`);

      let scssJsonObj = {
        updateAllSCSSWhenSave: jsonSetUp.isUpdateAllSCSSWhenSave(),
      }

      scssJsonObj.scssFileList = jsonSetUp.initializeJSONFileList(scssPathArr);

      if (fileHelper.checkExistence(scssJsonFilePath)) {
        scssJsonObj.scssFileList = jsonSetUp.reinitializeJSONFileList(scssJsonObj.scssFileList);
      }

      await fileHelper.createFileAsync([scssJsonFilePath], [JSON.stringify(scssJsonObj)]);

      return Promise.resolve("scssInitialize: SCSS initialize finish.");
    } else {
      return Promise.reject("scssInitialize: No styles found!");
    }

  } catch (e) {
    return Promise.reject(e);
  }
}

function setSCSSFileListener() {
  let watcher = chokidar.watch("public/stylesheets/scss/**", { ignoreInitial: true });
  watcher
    .on('add', function (path) {
      console.log(`setSCSSFileListener: File ${path} is added.`);
      jsonSetUp.addNewFileToJSON(fileHelper.formatPath(path), true);
      // TODO: compile
    })
    .on('unlink', function (path) {
      console.log(`setSCSSFileListener: File ${path} is removed.`);
      
      let formatPath = fileHelper.formatPath(path);
      jsonSetUp.removeFileFromJSON(formatPath);
      //TODO: check file exist
      fileHelper.removeFileAsync(fileHelper.replacePath(formatPath, fileNameFilterCondition));

    })
    .on('addDir', function (path) {
      console.log(`setSCSSFileListener: Directory ${path} is added.`);
    })
    .on('unlinkDir', function (path) {
      console.log(`setSCSSFileListener: Directory ${path} is removed.`);
    })
    .on('change', function (path) {
      console.log(`setSCSSFileListener: File ${path} has changed.`);
    })
    .on('error', function (e) {
      console.log(e);
    })
    .on('ready', function () {
      console.log("setSCSSFileListener: Listener setting is successful.")
      console.log("-------------------------------------------------------");
    });

}

function translateToCSS(filePath, isProduction = false) {
  let option = {
    file: filePath,
    sourceMapEmbed: isProduction ? true : false,
    outputStyle: isProduction ? "compressed" : "expanded",
  };
  let cssResult = sass.renderSync(option);
  if (cssResult instanceof Error) {
    throw cssResult.formatted;
  }

  return cssResult.css.toString();
}

module.exports = {
  scssInitialize,
  setSCSSFileListener
}