const fs = require("fs");
const fsAsync = require("fs/promises");
const glob = require("glob");
const path = require("path");

function checkExistence(path) {
  console.log(`checkExistence: ${path}`);
  return fs.existsSync(path);
}

function checkFileEmpty(path) {
  let result = fs.readFileSync(path);
  return result.length === 0;
}

function getChildDirectoryPath(parentDirectory) {
  return glob.sync(parentDirectory);
}

function getChildFilePath(parentDirectory) {
  return glob.sync(parentDirectory);
}

async function createDirectoryAsync(directoryArr, replaceCondition = null) {
  let replace = replaceCondition !== null ? true : false;
  let promiseArr = [];

  for (let i = 0; i < directoryArr.length; i++) {
    let directoryPath = directoryArr[i];

    if (replace) {
      directoryPath = replacePath(directoryPath, replaceCondition);
    }

    if (checkExistence(directoryPath)) {
      continue;
    };

    promiseArr.push(await fsAsync.mkdir(directoryPath));
  }

  return Promise.all(promiseArr);
}

async function createFileAsync(fileArr, contentArr, replaceCondition = null) {
  if (fileArr.length !== contentArr.length) {
    return Promise.reject("The size of file array and content array is different.");
  }

  let replace = replaceCondition !== null ? true : false;
  let promiseArr = [];

  for (let i = 0; i < fileArr.length; i++) {
    let filePath = fileArr[i];

    if (replace) {
      filePath = replacePath(filePath, replaceCondition);
    }

    promiseArr.push(await fsAsync.writeFile(filePath, contentArr[i]));
  }

  return Promise.all(promiseArr);
}

function removeDirectoryAsync(directoryPath) {
  if (checkExistence(directoryPath)) {
    console.log(`removeDirectoryAsync: ${directoryPath}`);
    return fsAsync.rm(directoryPath, { recursive: true, force: true });
  }
}

function removeFileAsync(filePath) {
  if (checkExistence(filePath)) {
    console.log(`removeFileAsync: ${filePath}`);
    return fsAsync.unlink(filePath);
  }
}

function formatPath(pathToFormat) {
  return path.join(__dirname, `../${pathToFormat}`).replace(/\\/g, "/");
}

function replacePath(path, replaceConditionArr) {
  for (let j = 0; j < replaceConditionArr.length; j++) {
    path = path.replace(
      replaceConditionArr[j][0],
      replaceConditionArr[j][1]
    );
  }

  return path;
}

module.exports = {
  checkExistence,
  checkFileEmpty,
  getChildDirectoryPath,
  getChildFilePath,
  createDirectoryAsync,
  createFileAsync,
  removeDirectoryAsync,
  removeFileAsync,
  formatPath,
  replacePath
};
