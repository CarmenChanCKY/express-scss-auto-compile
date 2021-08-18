const fs = require("fs");
const fsAsync = require("fs/promises");
const glob = require("glob");

/**
 *
 * @param {String} directoryPath
 * @returns {Boolean} true when directory exist, false when directory does not exist
 */
function checkExistence(directoryPath) {
  return fs.existsSync(directoryPath);
}

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

    promiseArr.push(await fsAsync.mkdir(directoryPath));
  }

  return Promise.all(promiseArr);
}

async function createFileAsync(fileArr, contentArr, filterCondition = null) {
  if (fileArr.length !== contentArr.length) {
    return Promise.reject("The size of file array and content array is different.");
  }

  let replace = filterCondition !== null ? true : false;
  let promiseArr = [];

  for (let i = 0; i < fileArr.length; i++) {
    let filePath = fileArr[i];

    if (replace) {
      for (let j = 0; j < filterCondition.length; j++) {
        filePath = filePath.replace(
          filterCondition[j][0],
          filterCondition[j][1]
        );
      }
    }

    promiseArr.push(await fsAsync.writeFile(filePath, contentArr[i]));
  }

  return Promise.all(promiseArr);
}

function removeDirectoryAsync(directoryPath) {
  return fsAsync.rm(directoryPath, { recursive: true, force: true });
}

function removeFileAsync(filePath) {
  return fsAsync.unlink(filePath);
}

module.exports = {
  checkExistence,
  getChildDirectoryPath,
  getChildFilePath,
  createDirectoryAsync,
  createFileAsync,
  removeDirectoryAsync,
  removeFileAsync
};
