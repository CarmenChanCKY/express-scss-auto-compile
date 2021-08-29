const path = require("path");
const chokidar = require('chokidar');
const sass = require("sass");
const fileHelper = require("../fileHelper.js");
const jsonSetUp = require("../json/jsonSetUp.js");

let cssDirectoryPath = path.join(__dirname, "../../public/stylesheets/css");
let scssDirectoryPath = path.join(__dirname, "../../public/stylesheets/scss");
let scssJsonFilePath = jsonSetUp.getJsonFilePath();

let directoryNameReplaceCondition = [["/scss/", "/css/"]];
let fileNameReplaceCondition = [
  ["/scss/", "/css/"],
  [".scss", ".css"],
];

// run it use the command from package.json
function scssForProduction() {
  scssInitialize()
    .then(function (result) {
      console.log(`Production ${result}`)
    })
    .catch(function (e) {
      console.log(`Production Fail: ${e}`);
    });
}

async function scssInitialize(isProduction = true) {
  try {
    // remove the css directory
    await fileHelper.removeDirectoryAsync(cssDirectoryPath);

    let scssFileArr = fileHelper.getChildFilePath(`${scssDirectoryPath}/**/!(_)*.scss`);

    if (scssFileArr.length >= 1) {
      // there are at least one scss file

      // compile scss files
      let scssDirectoryArr = fileHelper.getChildDirectoryPath(
        `${scssDirectoryPath}/**/!(*.scss)`
      );
      scssDirectoryArr.splice(0, 0, cssDirectoryPath);

      let contentArr = [];

      contentArr = scssFileArr.map(function (path) {
        return translateToCSS(path, isProduction);
      });

      await fileHelper.createDirectoryAsync(scssDirectoryArr, directoryNameReplaceCondition);
      await fileHelper.createFileAsync(scssFileArr, contentArr, fileNameReplaceCondition);

      let scssPathArr = fileHelper.getChildFilePath(`${scssDirectoryPath}/**/*.scss`);

      // initialize scssJson.json
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

// listen to the file change of scss folder
function setSCSSFileListener(isProduction = true) {
  let watcher = chokidar.watch("public/stylesheets/scss/**", { ignoreInitial: true });
  watcher
    .on('add', function (path) {
      // new file is added
      let formatPath = fileHelper.formatPath(path);
      jsonSetUp.addNewFileToJSON(formatPath, true);

      if (!fileHelper.checkFileEmpty(formatPath)) {
        fileHelper.createFileAsync([formatPath], [translateToCSS(formatPath, isProduction)], fileNameReplaceCondition)
          .catch(function (e) {
            console.log(e);
          });
      }

      console.log(`setSCSSFileListener: File ${path} is added.`);
      console.log("-------------------------------------------------------");
    })
    .on('unlink', function (path) {
      // new file is removed
      let formatPath = fileHelper.formatPath(path);
      jsonSetUp.removeFileFromJSON(formatPath);
      fileHelper.removeFileAsync(fileHelper.replacePath(formatPath, fileNameReplaceCondition));
      console.log(`setSCSSFileListener: File ${path} is removed.`);
      console.log("-------------------------------------------------------");
    })
    .on('addDir', function (path) {
      // new directory is added
      let formatPath = fileHelper.formatPath(path);
      fileHelper.createDirectoryAsync([formatPath], directoryNameReplaceCondition);
      console.log(`setSCSSFileListener: Directory ${path} is added.`);
      console.log("-------------------------------------------------------");
    })
    .on('unlinkDir', function (path) {
      // new directory is removed
      // NOTICE: for Windows user, it will trigger EPERM error if you want to delete an empty directory
      let formatPath = fileHelper.replacePath(path.replace(/\\/g, "/"), directoryNameReplaceCondition);
      console.log("path: " + formatPath);
      fileHelper.removeDirectoryAsync(formatPath);
      console.log(`setSCSSFileListener: Directory ${path} is removed.`);
      console.log("-------------------------------------------------------");
    })
    .on('change', function (path) {
      //file is changed
      let formatPath = fileHelper.formatPath(path);

      let updatePath = [];
      let cssContent = [];

      updatePath.push(formatPath);
      cssContent.push(translateToCSS(formatPath, isProduction));

      let linkSCSS = jsonSetUp.getLinkSCSS(formatPath);
      if (linkSCSS.length !== 0) {
        linkSCSS.forEach(function (link) {
          updatePath.push(link);
          cssContent.push(translateToCSS(link, isProduction));
        });
      }

      fileHelper.createFileAsync(updatePath, cssContent, fileNameReplaceCondition)
        .then(function () {
          updatePath.forEach(function (link) {
            console.log(`setSCSSFileListener: CSS File of ${link} has been updated.`);

          });
          console.log("-------------------------------------------------------");
        })
        .catch(function (e) {
          console.log(e);
        });
      console.log(`setSCSSFileListener: File ${path} has changed.`);
      console.log("-------------------------------------------------------");
    })
    .on('error', function (e) {
      console.log("error~!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      console.log(e);
    })
    .on('ready', function () {
      console.log("setSCSSFileListener: Listener setting is successful.")
      console.log("-------------------------------------------------------");
    });

}

function translateToCSS(filePath, isProduction = true) {
  // compile scss to css
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
  scssForProduction,
  scssInitialize,
  setSCSSFileListener,

}