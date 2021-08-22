const path = require("path");
const fs = require("fs");

let scssJsonFilePath = path.join(__dirname, "../../config/json/scssJson.json");
let updateAllSCSSWhenSave = false;

/**
 * initialize the file list of JSON file
 * @param {Array} fileArr contains all file names with .scss extension
 * @returns {Array} array of objects for initialize the file list
 */
function initializeJSONFileList(fileArr) {
    return fileArr.map(function (value) {
        return createNewFileObj(value);
    });
}

/**
 * Create an object for a file with .scss extension
 * @param {String} filePath path of the file
 * @returns {Object} object contains the update configuration of an file
 */

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

/**
 * Reinitialize and update the JSON file if there is a JSON file exist before
 * @param {Array} newSCSSFileList content that will be stored into the new JSON file
 * @returns {Array} array contains the updated content
 */

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

/**
 * Remove all the unexisting link in JSON file
 * @param {Array} JSONList contains the array of all .scss files in JSON file
 * @returns {Array} contains the objects with existing link only
 */

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


/**
 * Remove the unexisting link for a single file in JSON file
 * @param {Array} JSONList contains the array of all .scss files in JSON file
 * @param {Array} existingLinkArr contains the array of path of existing .scss files
 * @param {Number} fileIndex position of target .scss file
 * @returns {Array} contains the objects with existing link only
 */

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

/**
 * check whether the file path exist in the JSON file
 * @param {Array} fileArr searching array
 * @param {String} filePath searching path
 * @returns {Number} -1 when the file path is not found, index of the file path when the file path exist
 */

function checkFilePathExistInJSON(fileArr, filePath) {
    return fileArr.findIndex(function (obj) {
        return obj.filePath === filePath;
    });
}

/**
 * 
 * @returns {Boolean} whether the all the SCSS file will be compile again on save
 */

function isUpdateAllSCSSWhenSave() {
    return updateAllSCSSWhenSave;
}


/**
 * get the file path of the JSON file
 * @returns {String} file path of the JSON file
 */
function getJsonFilePath() {
    return scssJsonFilePath;
}

/**
 * get the content of the JSON file
 * @returns {Object} content of the JSON file
 */

function readJSONFile() {
    return JSON.parse(fs.readFileSync(scssJsonFilePath, "utf8"));
}

/**
 * update the content of JSON file
 * @param {Object} obj contains the JSON object needs to stored into JSON file
 */
function writeJSONFile(obj) {
    fs.writeFileSync(scssJsonFilePath, JSON.stringify(obj));
}

/**
 * Add and store an object for a new file with .scss extension
 * @param {*} newFilePath path of the new file
 * @param {Boolean} showErrorMsg whether the program should show the error message
 * @returns 
 */

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
