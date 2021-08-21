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

    let originalJSONList = readJSONFile();
    //let unexistingLinkArr = [];

    // get the unexisting link
    // copy the linkSCSS array in originalJSONList to newSCSSFileList 
    originalJSONList.scssFileList.forEach(function (originalObj, originalIndex) {
        let existPos = checkFilePathExistInJSON(newSCSSFileList, originalObj.filePath);
        if (existPos !== -1) {
            newSCSSFileList[existPos].linkSCSS = originalJSONList.scssFileList[originalIndex].linkSCSS;
        }
    });

    /*
    // remove the invalid link in linkSCSS array
    newSCSSFileList.forEach(function (newObj) {
        unexistingLinkArr.forEach(function (unexistingLink) {
            let removePos = newObj.linkSCSS.indexOf(unexistingLink);
            if (removePos !== -1) {
                newObj.linkSCSS.splice(removePos, 1);
            }
        });
    });

    newSCSSFileList = removeInvalidLink(newSCSSFileList);
*/

    newSCSSFileList = removeUnexistingLink(newSCSSFileList);
    return newSCSSFileList;

}

function removeUnexistingLink(JSONList = null) {
    if (JSONList === null) {
        JSONList = readJSONFile().scssFileList;
    }

    let unexistingLinkArr = JSONList.map(function (searchObj) {
        return searchObj.filePath;
    });

    JSONList.forEach(function (objValue, objIndex) {
        console.log(objValue.linkSCSS);

        /*
        objValue.linkSCSS.forEach(function (linkValue, linkIndex) {
            console.log(linkIndex);
            if (!unexistingLinkArr.includes(linkValue)) {
                // objValue.linkSCSS.splice(linkIndex, 1);
                if (JSONList[objIndex].linkSCSS.length === 1) {
                    JSONList[objIndex].linkSCSS = [];
                } else {
                    JSONList[objIndex].linkSCSS.splice(linkIndex, 1);
                }

            }
        });
        */

        JSONList[objIndex].linkSCSS = objValue.linkSCSS.filter(function (linkValue) {
            console.log(linkValue);
            return unexistingLinkArr.includes(linkValue)
        });
    });

    return JSONList;

}

/*
function removeInvalidLink(obj) {
    let searchValue = obj.map(function (searchObj) {
        return searchObj.filePath;
    });

    obj.forEach(function (objValue) {
        objValue.linkSCSS.forEach(function (linkValue, linkIndex) {
            if (!searchValue.includes(linkValue)) {
                objValue.linkSCSS.splice(linkIndex, 1);
            }
        });
    });

    return obj;
}
*/
function checkFilePathExistInJSON(fileObj, filePath) {
    return fileObj.findIndex(function (obj) {
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
            obj.scssFileList = removeUnexistingLink(obj.scssFileList);
            writeJSONFile(obj);
            console.log("removeFileFromJSON: File path has been removed from scssJSON.json");
        } catch (e) {
            console.log(e);
        }
    }
}
/*
function removeDuplicateLinkCSS(scssFileList, pathArr) {
    let result = [...scssFileList];
    scssFileList.forEach(function (obj) {
        obj.linkSCSS.forEach(function (scssValue) {
            if (pathArr.includes(scssValue)) {
                result.splice(pathArr.indexOf(scssValue), 1);
            }
        });
    });

    return result;
}

*/

module.exports = {
    initializeJSONFileList,
    reinitializeJSONFileList,
    isUpdateAllSCSSWhenSave,
    getJsonFilePath,
    addNewFileToJSON,
    removeFileFromJSON,
};
