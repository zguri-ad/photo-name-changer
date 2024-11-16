import Log from "../resources/modules/log.js";

const inputPath = document.getElementById("dir_path");
inputPath.innerHTML = await window.API.getLastStoredFolderPath();


const buttonOpenDir = document.getElementById("openDirectory");
let outputListDiv = document.getElementById('output_list');


const logOnpage = (object) => {
    let log = new Log(object, "output_list");
    log.setTitle();
    log.addListElement(object.cssClass);
}

const getPageInputData = () => {
    let folderPath = inputPath.innerHTML;
    let recursiveInput = document.getElementById("recursive");
    let isRecursive = recursiveInput.checked;
    let fileStartWithCheckbox = document.getElementById("fileStartWithCheckbox");
    let fileStartWithCheckboxValue = fileStartWithCheckbox.checked;
    let fileStartWithInput = document.getElementById("fileStartWithInput");
    let fileStartWithInputValue = fileStartWithInput.value;

    if (fileStartWithCheckboxValue === false) {
        fileStartWithInputValue = "";
    }

    let obj = {
        folderPath: folderPath,
        isRecursive: isRecursive,
        checkFileStartName: fileStartWithCheckboxValue,
        fileStartName: fileStartWithInputValue
    }

    return obj;
}

buttonOpenDir.addEventListener('click', async () => {
    const obj = getPageInputData();
    const { folderPath } = await window.API.selectFolder(obj);
    if (folderPath) {
        let log = new Log({folderPath: folderPath, processedFile: 0}, "output_list");
        log.setTitle("");
        inputPath.innerHTML = folderPath;
    }
});


document.getElementById('change_name').addEventListener('click', async () => {
    const obj = getPageInputData();

    try {
        const fileCount = await window.API.getFileCount(obj);
        let log = new Log({folderPath: obj.folderPath, processedFile: 0, totalFiles: fileCount}, "output_list");
        log.clearList();
        window.API.process(obj);
    } catch (error) {
        
    }
});

window.API.onUpdateProcessOutput((object) => {
    logOnpage(object);
});