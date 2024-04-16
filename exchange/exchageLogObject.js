export const logObject = {
    cssClass: "",
    totalFiles: 0,
    processedFile: 0,
    id: "",
    fileNameNew: "",
    fileNameOld: "",
    /**
     * @type ERROR_TYPE
     */
    errorType: ""
}

export const ERROR_TYPE = {
    FILE_NOT_JPEG: "FILE_NOT_JPEG",
    FILE_NOT_READ: "FILE_NOT_READ",
    FOLDER_NOT_PROCESSED: "FOLDER_NOT_PROCESSED",
    NO_CREATION_DATE_FOUND: "NO_CREATION_DATE_FOUND",
    RENAME_ERROR: "RENAME_ERROR"
}