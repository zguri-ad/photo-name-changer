import Log from "../resources/modules/log.js";

const inputPath = document.getElementById("dir_path");

const buttonOpenDir = document.getElementById("openDirectory");
let outputListDiv = document.getElementById('output_list');


const logOnpage = (object) => {
    let log = new Log(object, "output_list");
    log.setTitle();
    log.addListElement(object.cssClass);
}

buttonOpenDir.addEventListener('click', async () => {
    let folderPath = await window.API.selectFolder();
    if (folderPath) {
        let log = new Log({path: folderPath}, "output_list");
        log.setTitle("");
        inputPath.innerHTML = folderPath;
    }
});


document.getElementById('change_name').addEventListener('click', () => {
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

    let log = new Log({path: folderPath}, "output_list");
    log.clearList();

    try {
        let obj = {
            path: folderPath,
            isRecursive: isRecursive,
            checkFileStartName: fileStartWithCheckboxValue,
            fileStartName: fileStartWithInputValue
        }
        window.API.process(obj);
    } catch (error) {
        
    }
    
});

window.API.onUpdateProcessOutput((object) => {
    logOnpage(object);
});