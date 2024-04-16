const fs = require('fs');
let path = require('path');
const ExifParser = require('exif-parser');

let mainWindow = undefined;

const updateLog = (updateObject) => {
    mainWindow.webContents.send('update-output', updateObject);
}

const processFile = (folderPath, filePath, file, updateObject) => {
    fs.promises.readFile(filePath).then((data) => {
        console.log(`FilePath ${filePath}`);
        console.log(`File ${file}`);

        // const filePathNew = path.resolve(folderPath, file);
        updateObject.processedFile += 1;
        updateObject.path = folderPath;

        let aAllowedEndings = ['JPG', 'jpg', 'JPEG', 'jpeg'];
        let bStartsWithImg = true; //file.startsWith("IMG");
        let bEndsWithJpg = file.endsWith(".JPG");
        let aSplitFile = file.split('.');
        let fileEnding = aSplitFile[1];
        if (fileEnding === undefined) {
            fileEnding = 'JPG';
        }
        if (bStartsWithImg === true &&  aAllowedEndings.includes(fileEnding)) {
            const parser = ExifParser.create(data);
            const result = parser.parse();
            
            if (result.tags && result.tags.DateTimeOriginal ) {
                const creationDate = result.tags.DateTimeOriginal;
                const newDate = new Date(creationDate * 1000).toISOString()
                //'2022-12-16T15:32:54.000Z'
                let timestamp = newDate.replace("-", "");
                timestamp = timestamp.replace("-", "");
                timestamp = timestamp.replace(":", "");
                timestamp = timestamp.replace(":", "");
                timestamp = timestamp.replace(".000Z", "");
                timestamp = timestamp.replace("T", "_");
                //const timestamp = creationDate.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                //const newFileName = `${timestamp}_${file}`;
                const newFileName = `${timestamp}.${fileEnding}`;

                fs.rename(filePath, `${folderPath}/${newFileName}`, (err) => {
                    if (err) {
                        updateObject.path = folderPath;
                        updateObject.progress = `Processed ${updateObject.processedFile}/${updateObject.totalFiles}`;
                        updateObject.name = `Error renaming file ${file}:`;
                        updateObject.color = "red";
                        updateLog(updateObject);
                        console.error(`Error renaming file ${file}:`, err);
                    } else {
                        console.log(`Renamed ${file} to ${newFileName}`);
                    }
                });
                let newValue = `Renamed ${file} to ${newFileName}`;
                updateObject.path = folderPath;
                updateObject.progress = `Processed ${updateObject.processedFile}/${updateObject.totalFiles}`;
                updateObject.name = newValue;
                updateObject.color = "green";
                updateLog(updateObject);
            } else {
                updateObject.path = folderPath;
                updateObject.progress = `Processed ${updateObject.processedFile}/${updateObject.totalFiles}`;
                updateObject.name = `No creation date found for ${file}`;
                updateObject.color = "red";
                updateLog(updateObject);
                console.warn(`No creation date found for ${file}`);
            }
        } else {
            updateObject.path = folderPath;
            updateObject.progress = `Processed ${updateObject.processedFile}/${updateObject.totalFiles}`;
            updateObject.name = `The file ${file} is not a JPG or JPEG`;
            updateObject.color = "red";
            // updateObject.path = 
            updateLog(updateObject);
            console.warn(`The file ${file} is not a JPG or JPEG`);
        }
    })
    .catch((readErr) => {
        updateObject.path = folderPath;
        updateObject.progress = `Processed ${updateObject.processedFile}/${updateObject.totalFiles}`;
        updateObject.name = `Error reading file ${file}: ${readErr}`;
        updateObject.color = "red";
        updateLog(updateObject);
        console.error(`Error reading file ${file}:`, readErr);
    });
}

const changeName = (folderPath, isRecursive) => {
    console.log(`FolderPath ${folderPath}`);
        fs.readdir(folderPath, (err, files) => {
            if (err) {
            console.error('Error reading folder:', err);
            return;
            }

            let totalFiles = files.length;
            if (!totalFiles) return;

            let processedFile = 0;
            let updateObject = {
                name: "",
                progress: "",
                color: "",
                totalFiles: totalFiles,
                processedFile: 0,
                id: ""
            }
        
            files.forEach((file) => {
            const filePath = `${folderPath}/${file}`;
            
            fs.stat(filePath, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    if (isRecursive === true) {
                        changeName(filePath, isRecursive);
                    } else {
                        updateObject.path = folderPath;
                        updateObject.processedFile += 1;
                        updateObject.progress = `Processed ${updateObject.processedFile}/${updateObject.totalFiles}`;
                        updateObject.name = `Folder ${filePath} was not processed`;
                        updateObject.color = "";
                        updateLog(updateObject);
                    }
                } else {
                    processFile(folderPath, filePath, file, updateObject)
                }
            });

            
        });
    });
}

module.exports = {
    changeName: function(mw, obj) {
        mainWindow = mw;
        let folderPath = obj.path;
        let isRecursive = obj.isRecursive;

        
        changeName(folderPath, isRecursive);
    }
};