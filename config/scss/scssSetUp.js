const path = require("path");
const fs = require("fs");
const fsAsync = require("fs/promises");
const glob = require("glob");
const sass = require("sass");
const jsonSetUp = require("../json/jsonSetUp.js")

async function scssInitialize() {
  try {
    let cssDirectoryPath = path.join(__dirname, "../../public/stylesheets/css");
    let scssDirectoryPath = path.join(__dirname, "../../public/stylesheets/scss");
    let scssJsonFilePath = jsonSetUp.getJsonFilePath();

    if (checkExistence(cssDirectoryPath)) {
      await removeDirectory(cssDirectoryPath);
    }

    if (checkExistence(scssJsonFilePath)) {
      await removeFile(scssJsonFilePath);
    }

    let scssFileArr = getChildFilePath(`${scssDirectoryPath}/**/!(_)*.scss`);

    if (scssFileArr.length >= 1) {
      let scssDirectoryArr = getChildDirectoryPath(
        `${scssDirectoryPath}/**/!(*.scss)`
      );
      scssDirectoryArr.splice(0, 0, cssDirectoryPath);

      let directoryNameFilterCondition = [["/scss/", "/css/"]];
      let fileNameFilterCondition = [
        ["/scss/", "/css/"],
        [".scss", ".css"],
      ];

      await createDirectoryAsync(scssDirectoryArr, directoryNameFilterCondition);
      await createFileAsync(scssFileArr, fileNameFilterCondition, false);

      let scssJsonObj = {
        updateAllSCSSWhenSave: false,
      }

      scssJsonObj.scssFileList = jsonSetUp.initializeFileList(getChildFilePath(`${scssDirectoryPath}/**/*.scss`));
      await createFile(scssJsonFilePath, JSON.stringify(scssJsonObj));
      console.log("scss initialize finish.");
    } else {
      return Promise.reject("No styles found!");
    }

  } catch (e) {
    return Promise.reject(e);
  }
}

/**
 *
 * @param {String} directoryPath
 * @returns {Boolean} true when directory exist, false when directory does not exist
 */
function checkExistence(directoryPath) {
  return fs.existsSync(directoryPath);
}

function checkFileExist(fileName) { }

function getSingleFilePath(fileName) { }

function getChildDirectoryPath(parentDirectory) {
  return glob.sync(parentDirectory);
}

function getChildFilePath(parentDirectory) {
  return glob.sync(parentDirectory);
}

async function createDirectoryAsync(directoryArr, filterCondition = null) {
  let replace = filterCondition !== null ? true : false;
  let promiseArr = [];

  for (let i = 0; i < directoryArr.length; i++) {
    let directoryPath = directoryArr[i];

    if (replace) {
      for (let j = 0; j < filterCondition.length; j++) {
        directoryPath = directoryPath.replace(
          filterCondition[j][0],
          filterCondition[j][1]
        );
      }
    }

    promiseArr.push(await createDirectory(directoryPath));
  }

  return Promise.all(promiseArr);
}

function createDirectory(directoryPath) {
  return fsAsync.mkdir(directoryPath);
}

async function createFileAsync(
  fileArr,
  filterCondition = null,
  isProduction = false
) {
  let replace = filterCondition !== null ? true : false;
  let promiseArr = [];

  for (let i = 0; i < fileArr.length; i++) {
    let filePath = fileArr[i];
    let cssResult = await translateToCSS(filePath, isProduction);

    if (replace) {
      for (let j = 0; j < filterCondition.length; j++) {
        filePath = filePath.replace(
          filterCondition[j][0],
          filterCondition[j][1]
        );
      }
    }

    promiseArr.push(await createFile(filePath, cssResult.css.toString()));
  }

  return Promise.all(promiseArr);
}

function createFile(filePath, content) {
  return fsAsync.writeFile(filePath, content);
}

function translateToCSS(filePath, isProduction = false) {
  let option = {
    file: filePath,
    sourceMapEmbed: isProduction ? true : false,
    outputStyle: isProduction ? "compressed" : "expanded",
  };

  return new Promise((resolve, reject) => {
    let cssResult = sass.renderSync(option);
    if (cssResult instanceof Error) {
      return reject(cssResult);
    }

    return resolve(cssResult);
  });
}

function removeDirectoryAsync(directoryArr) { }

function removeDirectory(directoryPath) {
  return fsAsync.rm(directoryPath, { recursive: true, force: true });
}

function removeFileAsync(fileArr) { }

function removeFile(filePath) {
  return fsAsync.unlink(filePath);
}

module.exports = {
  scssInitialize,
  checkExistence,
  checkFileExist,
  getSingleFilePath,
  getChildDirectoryPath,
  getChildFilePath,
  createDirectoryAsync,
  createDirectory,
  createFileAsync,
};
