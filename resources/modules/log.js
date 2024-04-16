import { logObject, ERROR_TYPE } from "../../exchange/exchageLogObject.js";

export default class Log {
    constructor(obj, idLogPlacement) {
        /**
         * @type logObject
         */
        this.logObject = { ...logObject, ...obj };

        this.folderPath = this.logObject.path;
        this.idDetails = this.getIdFromPath(this.folderPath);
        this.idSummary = `summary_${this.idDetails}`;
        this.idUl = `ul_${this.idDetails}`;
        let outputListDiv = document.getElementById(idLogPlacement);

        try {
            this.details = document.getElementById(this.idDetails);
        } catch(err) {

        }
        if (this.details === undefined || this.details === null) {
            this._createLogElement();
            outputListDiv.appendChild(this.details);
        } else {
            this.details = document.getElementById(this.idDetails);
            this.summary = document.getElementById(this.idSummary);
            this.ul = document.getElementById(this.idUl);
        }
    }

    setTitle() {
        let title = this.createTitleText();
        this.summary.innerHTML = this.idDetails + " - " + title;
    }

    addListElement(cssClass) {
        let li = document.createElement("li");
        if (cssClass !== undefined && cssClass !== null && cssClass !== "") {
            li.classList.add(cssClass);
        }
        li.appendChild(document.createTextNode(this.createListItemText()));
        this.ul.appendChild(li);
    }

    createTitleText() {
        return `Processed ${this.logObject.processedFile}/${this.logObject.totalFiles}`;
    }

    createListItemText() {
        let text = "";
        switch (this.logObject.errorType) {
            case ERROR_TYPE.FILE_NOT_JPEG:
                text = `The file ${this.logObject.fileNameOld} is not a JPG or JPEG`;
                break;
            case ERROR_TYPE.FILE_NOT_READ:
                text = `Error reading file ${this.logObject.fileNameOld}`;
                break;
            case ERROR_TYPE.FOLDER_NOT_PROCESSED:
                text = `Folder ${this.logObject.fileNameOld} was not processed`;
                break;
            case ERROR_TYPE.NO_CREATION_DATE_FOUND:
                text = `No creation date found for ${this.logObject.fileNameOld}`;
                break;
            case ERROR_TYPE.RENAME_ERROR:
                text = `Error renaming file ${this.logObject.fileNameOld}:`;
                break;
            case "":
                text = `Renamed ${this.logObject.fileNameOld} to ${this.logObject.fileNameNew}`;
                break;
            default:
                text = `Error: the error type ${this.logObject.errorType} was not handled`;
                break;
        }

        return text;
    }

    clearList() {
        this.ul.innerHTML = null;
    }
    
    _createLogElement() {
        this.details = document.createElement("details");
        this.details.id = this.idDetails; 
        
        this.summary = document.createElement("summary");
        this.summary.id = this.idSummary;
        this.details.appendChild(this.summary);

        this.ul = document.createElement("ul");
        this.ul.id = this.idUl;
        this.details.appendChild(this.ul);
    }

    getIdFromPath = (folderPath) => {
        let result = "";
        if (folderPath !== "") {
            let splitNameArray = folderPath.split("\\");
            let lastItem = splitNameArray[splitNameArray.length - 1];
    
            let lastTryArray = lastItem.split("/");
            result = lastTryArray[lastTryArray.length - 1];
        }
        return result;
    }
}