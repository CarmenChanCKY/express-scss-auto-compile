const path = require("path");
const fs = require("fs");

let scssJsonFilePath = path.join(__dirname, "../../config/json/scssJson.json");
let updateAllSCSSWhenSave = false;

function initializeJSONFileList(fileArr) {
    return fileArr.map(function (value) {
        return createNewFileObj(value);
    });
}

function createNewFileObj(filePath) {
    let obj = {
        filePath: filePath,
    };
    let updateAll = false;
    if (filePath.search("/_") !== -1) {
        updateAll = true;
    }
    obj.updateAll = updateAll;
    obj.linkSCSS = [];
    return obj;
}

function reinitializeJSONFileList(newFileNameArr){
    
    let originalFileList=readJSONFile();

    // remove deleted scss's record in originalFileList

    // TODO:
    originalFileList.scssFileList.forEach(function(originalObj, originalIndex){
        if(checkFilePathExistInJSON(newFileArr, originalObj.filePath)===-1){
            console.log("not contain");
        }

    });






}


function isUpdateAllSCSSWhenSave() {
    return updateAllSCSSWhenSave;
}

function getJsonFilePath() {
    return scssJsonFilePath;
}

function readJSONFile() {
    return JSON.parse(fs.readFileSync(scssJsonFilePath, "utf8"));
}

function writeJSONFile(obj) {
    fs.writeFile(scssJsonFilePath, JSON.stringify(obj), function (err) {
        if (err) {
            console.log(error);
        } else {
            console.log("scssJSON.json update successful.");
        }
    });
}

function updateJSONFile(newFilePath, showErrorMsg = false) {
    // TODO: uncheck
    let filePath = formatPath(newFilePath);
    let obj = readJSONFile();
    let index = checkFilePathExistInJSON(obj.scssFileList, filePath);

    if (index !== -1) {
        if(showErrorMsg){
            console.log("File path exists in scssJSON.json");
        }
        return;
    }

    let newFileObj = createNewFileObj(filePath);
    obj.scssFileList.push(newFileObj);
    writeJSONFile(obj);
}

function checkFilePathExistInJSON(fileObj, filePath) {
    console.log("file: "+filePath);
    console.log("fileobj: "+fileObj);
    return fileObj.findIndex(function (obj) {
        console.log("obj.filePath: "+obj.filePath)
        return obj.filePath === filePath;
    });
}

function removeFileFromJSON(newFilePath) {
    // TODO: uncheck
    let filePath = formatPath(newFilePath);
    let obj = readJSONFile();
    let index = checkFilePathExistInJSON(obj.scssFileList, filePath);
    if (index !== -1) {
        obj.scssFileList.splice(index, 1);
        obj.scssFileList = removeDuplicateLinkCSS(obj.scssFileList, [filePath]);
        writeJSONFile(obj);
    }
    console.log("File path has been removed from scssJSON.json");
}

function removeDuplicateLinkCSS(scssFileList, pathArr) {
    let result = [...scssFileList];

    /*      TODO: 
        fileObj.linkSCSS.forEach(function (scssValue) {
        TypeError: Cannot read property 'forEach' of undefined 
        */
    scssFileList.forEach(function (obj) {
        let fileObj = obj.linkSCSS;
        fileObj.linkSCSS.forEach(function (scssValue) {
            if (pathArr.includes(scssValue)) {
                result.splice(pathArr.indexOf(scssValue), 1);
            }
        });
    });

    return result;
}

function formatPath(pathToFormat) {
    console.log(path.join(__dirname, `../../${pathToFormat}`).replace(/\\/g, "/"))
    return path.join(__dirname, `../../${pathToFormat}`).replace(/\\/g, "/");
}

module.exports = {
    initializeJSONFileList,
    reinitializeJSONFileList,
    isUpdateAllSCSSWhenSave,
    getJsonFilePath,
    updateJSONFile,
    removeFileFromJSON
};
