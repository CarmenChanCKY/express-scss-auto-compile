# express-scss-auto-compile
Compile [SCSS](https://github.com/sass/sass) file automatically in Express project.

## Features
- Auto compile the scss file on save
- Decide whether the related scss files should compile again when you save any scss file

## Set Up
Before setting up your project, please make sure you have installed [NodeJS](https://nodejs.org/en/download/) 14.0.0 or higher.
1. Clone the project
2. Run ```npm install```
3. Copy `/config` folder to your express project
4. Create a `.env` file, set a variable `ENV_MODE=development`
5. In `app.js`, include the following code segment:
   ```JavaScript
   var dotenv = require("dotenv");
    dotenv.config();

    var indexRouter = require("./routes/index");
    var scssInitialize = require("./config/scss/scssInitialize.js");

    if (process.env.ENV_MODE === "development") {
        scssInitialize.scssInitialize(false).then(function (result) {
            console.log(result);
            scssInitialize.setSCSSFileListener(false);
        }).catch(function (e) {
            console.log(e);
        });
    }
   ```
6. Run ```npm start``` for development mode.
7. If you want to prepare for production, please save all the scss files and run ```npm run startProduction```. It will compile all the scss files again. Then, you can upload the css files  for your production

## Instruction
### Structure
#### Basic File Structure
It is the folders and files that your project should contain before compile your SCSS files. Your scss files should exist in `/scss` folder. Sub-folder inside `/scss` is allowed.
```.
├── config
│   ├── json
│   │   └── jsonSetUp.js
│   ├── scss
│   │   └── scssInitialize.js
│   └── fileHelper.js
└── public
    └── stylesheet
        └── scss
 ```
 After compilation, your file structure should change to:
 ```.
├── config
│   ├── json
│   │   ├── jsonSetUp.js
│   │   └── scssJson.json
│   ├── scss
│   │   └── scssInitialize.js
│   └── fileHelper.js
└── public
    └── stylesheet
        ├── scss
        └── css
 ```

#### JSON Structure
`scssJson.json` is used to control the compile option. It will automatically upload when you add or remove folders  or scss files inside `/scss` folder. Please make sure your `scssJson.json` file contains the following structure:

```
{
"updateAllSCSSWhenSave": boolean: true/false,
"scssFileList": [
        {
            "filePath": string: path of scss file,
            "updateAll": boolean: true/false,
            "linkSCSS": array: []
        },
        {
            "filePath": string: path of scss file,
            "updateAll": boolean: true/false,
            "linkSCSS": array: []
        }
    ]
}
 ```

- `updateAllSCSSWhenSave` (default: false)
  Decide whether all the scss files will compile again when any one of the scss file has saved.
- `scssFileList`
  Array of objects use to store the data of all the scss files in `/scss` folder. Every scss file will create one object. It means the length of array should equal to the number of scss files. It will create and remove object automatically when a new scss file is created or removed.
- `filePath` 
  Store the file path of scss file inside `/scss` folder
- `updateAll` (default: false)
  Decide whether all the scss files will compile again when a specific scss file has saved.
- `linkSCSS`
  Store the path of scss files should compile when a specific scss file has saved

If you still don't understand the structure of `scssJson.json`, please read `/config/json/scssJson.json` in this repository.

### Folder and File Listener
This repository use [Chokidir](https://github.com/paulmillr/chokidar) to listen the folder and file changes of `/scss` file.

In this repository, listener will listen the events of folder and file add, removed. The listener will update the content of `scssJson.json` and control the auto-compile process.

To know more about the listener, please visit Chokidir repository.

**For Windows User, remove an empty folder will cause [EPERM error](https://github.com/paulmillr/chokidar/issues/566). Please avoid to delete empty folder.**

## Reference
- [Automatically Compile SASS Using Node.js and Express - Developer's Notebook - A Website for Developers and Technology Enthusiasts](https://www.developers-notebook.com/development/automatically-compile-sass-using-node-js-and-express/)
- [Chokidar](https://github.com/paulmillr/chokidar)
- [Deleting an empty directory triggers error instead of unlinkDir · Issue #566 · paulmillr/chokidar · GitHub](https://github.com/paulmillr/chokidar/issues/566)
- [javascript - Run function in script from command line (Node JS) - Stack Overflow](https://stackoverflow.com/questions/30782693/run-function-in-script-from-command-line-node-js/43598047#43598047)
- [node-glob](https://github.com/isaacs/node-glob#readme)
- [SASS](https://sass-lang.com/)
