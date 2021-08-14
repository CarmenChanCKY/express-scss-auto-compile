const path = require("path");

let scssJsonFilePath = path.join(__dirname, "../../config/json/scssJson.json");

function initializeFileList(fileArr) {
    return fileArr.map(function (value) {
        let obj = {
            filePath: value,
        };
        let updateAll = false;
        if (value.search("/_") !== -1) {
            updateAll = true;
        }
        obj.updateAll = updateAll;
        obj.linkSCSS = [];
        return obj;
    });
}

function getJsonFilePath() {
    return scssJsonFilePath;
}

function appendMultipleFileData(dataArr) { }

async function appendFileData(data) { }

module.exports = {
    initializeFileList,
    getJsonFilePath,
};
