const path = require("path");
const chokidar = require('chokidar');
const sass = require("sass");
const fileHelper = require("../fileHelper.js");
const jsonSetUp = require("../json/jsonSetUp.js");

let cssDirectoryPath = path.join(__dirname, "../../public/stylesheets/css");
let scssDirectoryPath = path.join(__dirname, "../../public/stylesheets/scss");
let scssJsonFilePath = jsonSetUp.getJsonFilePath();

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

      let directoryNameFilterCondition = [["/scss/", "/css/"]];
      let fileNameFilterCondition = [
        ["/scss/", "/css/"],
        [".scss", ".css"],
      ];

      let contentArr = [];
      // TODO: development or production
      contentArr = scssFileArr.map(function (path) {
        return translateToCSS(path, false);
      })

      await fileHelper.createDirectoryAsync(scssDirectoryArr, directoryNameFilterCondition);
      await fileHelper.createFileAsync(scssFileArr, contentArr, fileNameFilterCondition);

      let scssPathArr = fileHelper.getChildFilePath(`${scssDirectoryPath}/**/*.scss`);

      if (fileHelper.checkExistence(scssJsonFilePath)) {
        jsonSetUp.reinitializeJSONFileList(scssPathArr);
      }else{
        let scssJsonObj = {
          updateAllSCSSWhenSave: jsonSetUp.isUpdateAllSCSSWhenSave(),
        }
  
        scssJsonObj.scssFileList = jsonSetUp.initializeJSONFileList(scssPathArr);
        await fileHelper.createFileAsync([scssJsonFilePath], [JSON.stringify(scssJsonObj)]);
      }

      return Promise.resolve("scss initialize finish.");
    } else {
      return Promise.reject("No styles found!");
    }

  } catch (e) {
    return Promise.reject(e);
  }
}

function setSCSSFileListener() {

  let watcher = chokidar.watch("public/stylesheets/scss/**");
  watcher
    .on('add', function (path) {
      console.log(`File ${path} is added.`);
      jsonSetUp.updateJSONFile(path, true);
    })
    .on('unlink', function (path) {
      console.log(`File ${path} is removed.`);
      jsonSetUp.removeFileFromJSON(path);
      // TODO: remove from /css
    })
    .on('addDir', function (path) {
    })
    .on('unlinkDir', function (path) {
    })
    .on('change', function (path) {
    })
    .on('error', function (e) {
    })
    .on('ready', function () {
      console.log("Listener setting is successful.")
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