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

function reinitializeJSONFileList(newSCSSFileList) {
    // get the content of existing JSON file
    let originalJSONList = readJSONFile();

    // copy the linkSCSS array in originalJSONList to newSCSSFileList 
    originalJSONList.scssFileList.forEach(function (originalObj, originalIndex) {
        let existPos = checkFilePathExistInJSON(newSCSSFileList, originalObj.filePath);
        if (existPos !== -1) {
            newSCSSFileList[existPos].linkSCSS = originalJSONList.scssFileList[originalIndex].linkSCSS;
        }
    });

    // remove the invalid link in linkSCSS array
    newSCSSFileList = removeAllUnexistingLink(newSCSSFileList);
    return newSCSSFileList;
}

function removeAllUnexistingLink(JSONList = null) {
    if (JSONList === null) {
        JSONList = readJSONFile().scssFileList;
    }

    let existingLinkArr = getAllPath(JSONList);

    JSONList.forEach(function (objValue, objIndex) {
        JSONList[objIndex].linkSCSS = objValue.linkSCSS.filter(function (linkValue) {
            return existingLinkArr.includes(linkValue);
        });
    });

    return JSONList;
}

function removeSingleFileUnexistingLink(JSONList = null, existingLinkArr = null, fileIndex) {
    if (JSONList === null) {
        JSONList = readJSONFile().scssFileList;
    }
    if (existingLinkArr === null) {
        existingLinkArr = getAllPath(JSONList);
    }

    return JSONList[fileIndex].linkSCSS.filter(function (linkValue) {
        return existingLinkArr.includes(linkValue);
    });
}

function checkFilePathExistInJSON(fileArr, filePath) {
    return fileArr.findIndex(function (obj) {
        return obj.filePath === filePath;
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
    fs.writeFileSync(scssJsonFilePath, JSON.stringify(obj));
}

function addNewFileToJSON(newFilePath, showErrorMsg = false) {
    let obj = readJSONFile();
    let index = checkFilePathExistInJSON(obj.scssFileList, newFilePath);

    if (index !== -1) {
        if (showErrorMsg) {
            console.log("addNewFileToJSON: File path exists in scssJSON.json");
        }
        return;
    }

    let newFileObj = createNewFileObj(newFilePath);
    obj.scssFileList.push(newFileObj);
    writeJSONFile(obj);
}

function removeFileFromJSON(newFilePath) {
    let obj = readJSONFile();
    let index = checkFilePathExistInJSON(obj.scssFileList, newFilePath);
    if (index !== -1) {
        try {
            obj.scssFileList.splice(index, 1);
            obj.scssFileList = removeAllUnexistingLink(obj.scssFileList);
            writeJSONFile(obj);
            console.log("removeFileFromJSON: File path has been removed from scssJSON.json");
        } catch (e) {
            console.log(e);
        }
    }
}

function getLinkSCSS(path) {
    let obj = readJSONFile();
    let pathArr = getAllPath(obj.scssFileList);
    if (obj.updateAllSCSSWhenSave) {
        return pathArr;
    }

    let index = checkFilePathExistInJSON(obj.scssFileList, path);
    if (index !== -1) {
        if (obj.scssFileList[index].updateAll) {
            return pathArr;
        } else {
            return removeSingleFileUnexistingLink(obj.scssFileList, pathArr, index);
        }
    }
    return [];
}

function getAllPath(obj) {
    return obj.map(function (searchObj) {
        return searchObj.filePath;
    });
}

module.exports = {
    initializeJSONFileList,
    reinitializeJSONFileList,
    isUpdateAllSCSSWhenSave,
    getJsonFilePath,
    addNewFileToJSON,
    removeFileFromJSON,
    getLinkSCSS
};
