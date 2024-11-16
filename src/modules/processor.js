import fs from 'node:fs';

import PictureReader from './pictureReader.js';
import { logObject, ERROR_TYPE } from "../../exchange/exchageLogObject.js";

/**
 * Exchange Object between Renderer and Process Module
 */
let processObject = {
    /** Folder Path */
    folderPath: "",
    /** Process all folders in the path recursively */
    isRecursive: "",
    /** Process only files that start with fileStartName */
    checkFileStartName: "",
    /** Consider only files that start with it */
    fileStartName: ""
}

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
    pictureReader = undefined;

    constructor(electronWindow) {
        this.mainWindow = electronWindow;
        this.pictureReader = new PictureReader()
    }

    /**
     * 
     * @param {processObject} object 
     */
    async getJpegFiles(object) {
        const folderPath = object.folderPath;
        console.log(`FolderPath ${folderPath}`);

        let files = await fs.promises.readdir(folderPath);

        files = files.filter((fl) => { 
            if (
                fl.endsWith('JPG') ||
                fl.endsWith('jpg') ||
                fl.endsWith('JPEG') ||
                fl.endsWith('jpeg') ||
                fl.endsWith('heic') ||
                fl.endsWith('HEIC') ||
                fl.endsWith('png') ||
                fl.endsWith('PNG') ||
                fl.endsWith('mov') ||
                fl.endsWith('MOV')
            ) {
                return fl;
            }
        });

        if (object.checkFileStartName === true && object.fileStartName !== "") {
            files = files.filter((fl) => fl.startsWith(object.fileStartName));
        }
        return files;
    }

    /**
     * 
     * @param {string} file 
     * @param {processObject} obj 
     */
    async changeNameForFile(file, obj) {
        let folderPath = obj.folderPath;
        let isRecursive = obj.isRecursive;
        let checkFileStartName = obj.checkFileStartName;
        let fileStartName = obj.fileStartName;
        const filePath = `${folderPath}/${file}`;
        console.log(`FolderPath ${folderPath}`);
        console.log(`FilePath ${filePath}`);
        console.log(`File ${file}`);

        let updateObject = { ...logObject };
        const data = await fs.promises.readFile(filePath);


        updateObject.folderPath = folderPath;

        let aSplitFile = file.split('.');
        let fileEnding = aSplitFile[1];
        if (fileEnding === undefined) {
            fileEnding = 'JPG';
        }
        let newFileName = "";
        try {
            const videoEssentials = await this.pictureReader.getVideoEssentials(`${folderPath}\\${file}`);
            if (videoEssentials && videoEssentials.creationDate) {
                newFileName = this.pictureReader.stringFromDate2(videoEssentials.creationDate);
                newFileName = `${newFileName}.${fileEnding}`; 
            } else {
                newFileName = await this.pictureReader.createFileNameFromDate(data, fileEnding);
            }

            if (!newFileName) {
                const match = file.match(/^\d{4}-\d{2}-\d{2} \d{2}-\d{2}-\d{2}$/);
                if (match) {
                    newFileName = newFileName.replaceAll('-', '');
                    newFileName = newFileName.replace(' ', '_');
                }
            }
        } catch(err) {
            console.log("Error: " + file);
        }

        if (newFileName) {
            fs.rename(filePath, `${folderPath}/${newFileName}`, (err) => {
                if (err) {
                    updateObject.folderPath = folderPath;
                    updateObject.cssClass = "red";
                    updateObject.fileNameOld = file;
                    updateObject.fileNameNew = "";
                    updateObject.errorType = ERROR_TYPE.RENAME_ERROR;
                    console.error(`Error renaming file ${file}:`, err);
                } else {
                    console.log(`Renamed ${file} to ${newFileName}`);
                }
            });
            updateObject.folderPath = folderPath;
            updateObject.cssClass = "green";
            updateObject.fileNameOld = file;
            updateObject.fileNameNew = newFileName;
            updateObject.errorType = "";
        } else {
            updateObject.folderPath = folderPath;
            updateObject.cssClass = "red";
            updateObject.fileNameOld = file;
            updateObject.fileNameNew = "";
            updateObject.errorType = ERROR_TYPE.NO_CREATION_DATE_FOUND;
            console.warn(`No creation date found for ${file}`);
        }
        return updateObject;
    }

    /**
     * 
     * @param {processObject} obj 
     */
    process(obj) {
        // merge the properties from obj with what we excpect
        let object = { ...processObject, ...obj };

        this.changeName(object);
    }

    /**
     * Change picture names
     * @param {processObject} object 
     */
    changeName(object) {
        let folderPath = object.folderPath;
        let isRecursive = object.isRecursive;
        console.log(`FolderPath ${folderPath}`);

        fs.readdir(folderPath, (err, files) => {
            if (err) {
                console.error('Error reading folder:', err);
                return;
            }

            let updateObject = { ...logObject };

            if (object.checkFileStartName === true && object.fileStartName !== "") {
                files = files.filter((fl) => fl.startsWith(object.fileStartName));
            }

            let totalFiles = files.length;
            if (!totalFiles) {
                updateObject.folderPath = folderPath;
                updateObject.processedFile = 0;
                updateObject.cssClass = "red";
                updateObject.fileNameOld = "No files found!";
                updateObject.errorType = ERROR_TYPE.FOLDER_NOT_PROCESSED;
                this.updateLog(updateObject);
                return;
            }

            
            updateObject.totalFiles = totalFiles;
        
            files.forEach((file) => {
                const filePath = `${folderPath}/${file}`;
            
                fs.stat(filePath, (err, stat) => {
                    if (stat && stat.isDirectory()) {
                        if (isRecursive === true) {
                            let dirObject = { ...object };
                            dirObject.folderPath = filePath;
                            this.changeName(dirObject);
                        } else {
                            updateObject.folderPath = folderPath;
                            updateObject.processedFile += 1;
                            updateObject.cssClass = "";
                            updateObject.fileNameOld = filePath;
                            updateObject.errorType = ERROR_TYPE.FOLDER_NOT_PROCESSED;
                            this.updateLog(updateObject);
                        }
                    } else {
                        this.processFile(folderPath, filePath, file, updateObject)
                        .then(logObject => {
                            if (logObject) {
                                logObject.processedFile += 1;
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
        
                updateObject.folderPath = folderPath;
        
                let aAllowedEndings = ['JPG', 'jpg', 'JPEG', 'jpeg'];
                let bStartsWithImg = true; //file.startsWith("IMG");
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
                        const newFileName = this.createFileNameFromDate(creationDate, fileEnding);
        
                        fs.rename(filePath, `${folderPath}/${newFileName}`, (err) => {
                            if (err) {
                                updateObject.folderPath = folderPath;
                                updateObject.cssClass = "red";
                                updateObject.fileNameOld = file;
                                updateObject.fileNameNew = "";
                                updateObject.errorType = ERROR_TYPE.RENAME_ERROR;
                                resolve(updateObject);
                                console.error(`Error renaming file ${file}:`, err);
                            } else {
                                console.log(`Renamed ${file} to ${newFileName}`);
                            }
                        });
                        updateObject.folderPath = folderPath;
                        updateObject.cssClass = "green";
                        updateObject.fileNameOld = file;
                        updateObject.fileNameNew = newFileName;
                        updateObject.errorType = "";
                        resolve(updateObject);
                    } else {
                        updateObject.folderPath = folderPath;
                        updateObject.cssClass = "red";
                        updateObject.fileNameOld = file;
                        updateObject.fileNameNew = "";
                        updateObject.errorType = ERROR_TYPE.NO_CREATION_DATE_FOUND;
                        resolve(updateObject);
                        console.warn(`No creation date found for ${file}`);
                    }
                } else {
                    updateObject.folderPath = folderPath;
                    updateObject.cssClass = "red";
                    updateObject.fileNameOld = file;
                    updateObject.fileNameNew = "";
                    updateObject.errorType = ERROR_TYPE.FILE_NOT_JPEG;
                    resolve(updateObject);
                    console.warn(`The file ${file} is not a JPG or JPEG`);
                }
            })
            .catch((readErr) => {
                updateObject.folderPath = folderPath;
                updateObject.cssClass = "red";
                updateObject.fileNameOld = file;
                updateObject.fileNameNew = "";
                updateObject.errorType = ERROR_TYPE.FILE_NOT_READ;
                resolve(updateObject);
                console.error(`Error reading file ${file}:`, readErr);
            });
        });
        
    }

    createFileNameFromDate(date, fileEnding) {
        const newDate = new Date(date * 1000).toISOString()
        //'2022-12-16T15:32:54.000Z'
        let timestamp = newDate.replace("-", "");
        timestamp = timestamp.replace("-", "");
        timestamp = timestamp.replace(":", "");
        timestamp = timestamp.replace(":", "");
        timestamp = timestamp.replace(".000Z", "");
        timestamp = timestamp.replace("T", "_");
        //const timestamp = creationDate.replace(/[^0-9]/g, ''); // Remove non-numeric characters
        //const newFileName = `${timestamp}_${file}`;
        return `${timestamp}.${fileEnding}`;
    }

    updateLog(updateObject) {
        this.mainWindow.webContents.send('update-output', updateObject);
    }
}
