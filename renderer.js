const {shell} = require("electron");
const ipc = require("electron").ipcRenderer;

function launchLongman(keyword){
  console.log("lanch Longman");
  shell.openExternal(`https://www.ldoceonline.com/dictionary/${keyword}`)
  setTimeout(() => {
    ipc.send("close-window");
  }, 500);
}

