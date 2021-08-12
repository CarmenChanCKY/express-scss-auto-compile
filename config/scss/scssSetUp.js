const path = require("path");
const fs = require("fs");
const fsAsync = require("fs/promises");
const glob = require("glob");
const async = require("async");
const sass = require("sass");

/**
 *
 * @param {String} folderPath
 * @returns {Boolean} true when folder exist, false when folder does not exist
 */
function checkFolderExist(folderPath) {
  return fs.existsSync(folderPath);
}

function checkFileExist(fileName) { }

function getSingleFilePath(fileName) { }

function getChildFolderPath(parentFolder) {
  return glob.sync(parentFolder);
}

function getChildFilePath(parentFolder) {
  return glob.sync(parentFolder);
}

async function createDirectoryAsync(folderArr, filterCondition = null) {
  let replace = (filterCondition !== null) ? true : false;
  let promiseArr = [];

  for (let i = 0; i < folderArr.length; i++) {
    let folderPath = folderArr[i];

    if (replace) {
      for (let j = 0; j < filterCondition.length; j++) {
        folderPath = folderPath.replace(filterCondition[j][0], filterCondition[j][1]);
      }
    }

    promiseArr.push(await createDirectory(folderPath));
  }

  return Promise.all(promiseArr);
}

function createDirectory(folderPath) {
  return fsAsync.mkdir(folderPath);
}

async function createFileAsync(fileArr, filterCondition = null, isProduction = false) {
  let replace = (filterCondition !== null) ? true : false;
  let promiseArr = [];

  for (let i = 0; i < fileArr.length; i++) {
    let filePath = fileArr[i];
    let cssResult = await translateToCSS(filePath, isProduction);

    if (replace) {
      for (let j = 0; j < filterCondition.length; j++) {
        filePath = filePath.replace(filterCondition[j][0], filterCondition[j][1]);
      }
    }

    promiseArr.push(await createFile(filePath, cssResult.css.toString()));
  }

  return Promise.all(promiseArr);
}

function createFile(filePath, content) {
  fsAsync.writeFile(filePath, content);
}

function translateToCSS(filePath, isProduction = false) {
  let option = {
    file: filePath,
    sourceMapEmbed: isProduction ? true : false,
    outputStyle: isProduction ? "compressed" : "expanded"
  }

  return new Promise((resolve, reject) => {
    let cssResult = sass.renderSync(option);
    if (cssResult instanceof Error) {
      return reject(cssResult);
    }

    return resolve(cssResult);
  });
}


module.exports = {
  checkFolderExist,
  checkFileExist,
  getSingleFilePath,
  getChildFolderPath,
  getChildFilePath,
  createDirectoryAsync,
  createDirectory,
  createFileAsync,
};
