import fs from 'fs';
import ExifParser from 'exif-parser';
import { logObject, ERROR_TYPE } from "../../exchange/exchageLogObject.js";

let processor = undefined;
const getProcessorInstance = (mw) => {
    if (processor !== undefined && processor !== null) {
        return processor;
    }

    processor = new Processor(mw);
    return processor;
}

export default class Processor {
    mainWindow = undefined;

    constructor(electronWindow) {
        this.mainWindow = electronWindow;
    }

    process(obj) {
        let folderPath = obj.path;
        let isRecursive = obj.isRecursive;

        this.changeName(folderPath, isRecursive);
    }

    changeName(folderPath, isRecursive) {
        console.log(`FolderPath ${folderPath}`);
        fs.readdir(folderPath, (err, files) => {
            if (err) {
                console.error('Error reading folder:', err);
                return;
            }

            let totalFiles = files.length;
            if (!totalFiles) return;

            let updateObject = logObject;
            updateObject.totalFiles = totalFiles;
        
            files.forEach((file) => {
                const filePath = `${folderPath}/${file}`;
            
                fs.stat(filePath, (err, stat) => {
                    if (stat && stat.isDirectory()) {
                        if (isRecursive === true) {
                            this.changeName(filePath, isRecursive);
                        } else {
                            updateObject.path = folderPath;
                            updateObject.processedFile += 1;
                            updateObject.progress = `Processed ${updateObject.processedFile}/${updateObject.totalFiles}`;
                            updateObject.color = "";
                            updateObject.fileNameOld = filePath;
                            updateObject.errorType = ERROR_TYPE.FOLDER_NOT_PROCESSED;
                            this.updateLog(updateObject);
                        }
                    } else {
                        this.processFile(folderPath, filePath, file, updateObject)
                        .then(logObject => {
                            if (logObject) {
                                this.updateLog(logObject);
                            }
                        });
                    }
                });

            
            });
        });
    }

    processFile(folderPath, filePath, file, updateObject) {
        return new Promise((resolve, reject) => {
            fs.promises.readFile(filePath).then((data) => {
                console.log(`FilePath ${filePath}`);
                console.log(`File ${file}`);
        
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
                                updateObject.color = "red";
                                updateObject.fileNameOld = file;
                                updateObject.fileNameNew = "";
                                updateObject.errorType = ERROR_TYPE.RENAME_ERROR;
                                this.updateLog(updateObject);
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
                        updateObject.fileNameOld = file;
                        updateObject.fileNameNew = newFileName;
                        updateObject.errorType = "";
                        this.updateLog(updateObject);
                    } else {
                        updateObject.path = folderPath;
                        updateObject.progress = `Processed ${updateObject.processedFile}/${updateObject.totalFiles}`;
                        updateObject.color = "red";
                        updateObject.fileNameOld = file;
                        updateObject.fileNameNew = "";
                        updateObject.errorType = ERROR_TYPE.NO_CREATION_DATE_FOUND;
                        this.updateLog(updateObject);
                        console.warn(`No creation date found for ${file}`);
                    }
                } else {
                    updateObject.path = folderPath;
                    updateObject.progress = `Processed ${updateObject.processedFile}/${updateObject.totalFiles}`;
                    updateObject.color = "red";
                    updateObject.fileNameOld = file;
                    updateObject.fileNameNew = "";
                    updateObject.errorType = ERROR_TYPE.FILE_NOT_JPEG;
                    this.updateLog(updateObject);
                    console.warn(`The file ${file} is not a JPG or JPEG`);
                }
            })
            .catch((readErr) => {
                updateObject.path = folderPath;
                updateObject.progress = `Processed ${updateObject.processedFile}/${updateObject.totalFiles}`;
                updateObject.color = "red";
                updateObject.fileNameOld = file;
                updateObject.fileNameNew = "";
                updateObject.errorType = ERROR_TYPE.FILE_NOT_READ;
                this.updateLog(updateObject);
                console.error(`Error reading file ${file}:`, readErr);
            });
        });
        
    }

    updateLog(updateObject) {
        this.mainWindow.webContents.send('update-output', updateObject);
    }
}
