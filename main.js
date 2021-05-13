const path = require('path')
const api = require("./src/models/api");
//const log = require("loglevel");
const log = require('electron-log');
const appModel = require("./src/models/app");
const { Notification } = require('electron')
const Monitor = require("./src/models/Monitor");
log.trace = () => {};

log.info("update app...");
const r = require('update-electron-app')()
log.debug("retrun from updater:", r);

//auto reload
try {
	require('electron-reloader')(module);
} catch (_) {}

const { ipcMain, app, BrowserWindow, globalShortcut, Menu, Tray} = require('electron')

console.log("process.env.NODE_ENV:", process.env.NODE_ENV);

const ENV = process.env.NODE_ENV || "prod";

console.log("init app with env:", ENV);


function showNotification (message, callback) {
  const notification = {
    title: 'Dadiorapp',
    body: message,
  }
  const resolve = new Notification(notification);
  resolve.on("close", function(){
    log.warn("close notification");
    callback && callback();
  });
  resolve.show();
};


function createWindow () {
  console.log("create win");
  const win = new BrowserWindow({
    width: 682,
    height: 432,
    webPreferences: {
      nodeIntegration: true
    },
    frame: false,
  })

  console.log("created window:", win.id);

//  win.on('show', () => {
//    console.log("on show");
//    setTimeout(() => {
//      console.log("win focus");
//      win.focus();
//    }, 300);
//  });

  if(ENV === "dev"){
    //for dev
    win.loadURL('http://localhost:3000/');
  }else if(ENV === "prod" || ENV === "production"){
    //for prod
    win.loadFile('build/index.html')
  }else{
    throw new Error("wrong env");
  }

}

function activeApp(){
  if (BrowserWindow.getAllWindows().length === 0) {
    console.log("no windows, create one");
    createWindow()
  }else{
    console.log("active existed window");
    BrowserWindow.getAllWindows().forEach(win => {
      console.log("show window:", win.id);
      win.show();
    });
  }
}

function closeWindow(){
  if (BrowserWindow.getAllWindows().length === 0) {
    console.log("no windows");
  }else{
    BrowserWindow.getAllWindows().forEach(win => {
      console.log("close window:", win.id);
      win.hide();
    });
  }
}

ipcMain.on("close-window", e => {
  console.log("ipc close window");
  closeWindow();
});

ipcMain.handle("cal", async (e, a) => {
  console.log("cal:", e, a);
  //try to calculate
  try{
    const result = eval(a);
    const calResult = parseFloat(result);
    if(calResult){
      console.log("cal:", calResult);
      return calResult
    }
  }catch(e){
    console.log("fail:", e);
  }
  return;
});

ipcMain.handle("handleInputChange", async (e, ...args) => {
  const r = await api.handleInputChange(...args);
  log.debug("input handle:", r);
  return r;
});

ipcMain.handle("action", async (e, ...args) => {
  const r = await api.action(...args);
  console.log("ipc close window");
  closeWindow();
});

app.whenReady().then(() => {
  console.log("ready");
  createWindow();
})

//app.on('window-all-closed', () => {
//  if (process.platform !== 'darwin') {
//    app.quit()
//  }
//})
//

app.on('activate', () => {
  console.log("on active");
  if (BrowserWindow.getAllWindows().length === 0) {
    console.log("create in active");
    createWindow()
  }
})

app.on('ready', async () => {
  console.log("on ready");
  
  //shortcut
//  globalShortcut.register('Ctrl+Shift+Alt+D', () => {
  globalShortcut.register('Alt+D', () => {
    console.log("press")
    activeApp();
  });

  //tray icon
  const iconName = 'iconTemplate.png';//'b2.jpg'
  const iconPath = path.join(__dirname, iconName)
  appIcon = new Tray(iconPath)

  //dock icon
  app.dock.hide();

  const contextMenu = Menu.buildFromTemplate([{
    label: 'Open Dadiorapp v0.2',
    click: () => {
      activeApp()
    }
  }])

  appIcon.setToolTip('Dadiorapp')
  appIcon.setContextMenu(contextMenu)

  const appDataDirectory = app.getPath('userData');
  let dbFilePath = appDataDirectory + '/data/';
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev') {
    dbFilePath = './data/';
  }
  log.info('NODE_ENV:%s, dbFilePath:%s', process.env.NODE_ENV, dbFilePath);
  await appModel.init(dbFilePath);

//  setTimeout(() => {
//    showNotification("xxxxxxxx", function(){
//      log.warn("closed");
//    });
//  }, 1000);
//
  const monitor = new Monitor();
  monitor.onAlert(() => {
    log.warn("on alert");
    showNotification("The service is broken!", function(){
      log.warn("closed");
    });
  });
  monitor.start();

  showNotification("I am with you");
  setInterval(() => {
    showNotification("I am with you", function(){
      log.warn("closed 2");
    });
  }, 1000*60*60*5);

});

//app.on('window-all-closed', () => {
//  if (appIcon) appIcon.destroy()
//})

