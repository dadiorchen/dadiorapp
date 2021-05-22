const path = require('path')
const api = require("./src/models/api");
//const log = require("loglevel");
const log = require('electron-log');
const appModel = require("./src/models/app");
const { Notification } = require('electron')
const Monitor = require("./src/models/Monitor");
const fs = require("fs");
const package = require("./package.json");
log.trace = () => {};

log.info("update app...");
const r = require('update-electron-app')({
  repo: 'dadiorchen/dadiorapp',
  updateInterval: '5 minutes',
  logger: log,
})
log.debug("retrun from updater:", r);

//auto reload
try {
	require('electron-reloader')(module);
} catch (_) {}

const { ipcMain, app, BrowserWindow, globalShortcut, Menu, Tray} = require('electron')

log.log("process.env.NODE_ENV:", process.env.NODE_ENV);

log.log("path home:", app.getPath("home"));
log.log("path appData:", app.getPath("appData"));
log.log("path userData:", app.getPath("userData"));
log.log("path cache:", app.getPath("cache"));
log.log("path temp:", app.getPath("temp"));
log.log("path exe:", app.getPath("exe"));
log.log("path module:", app.getPath("module"));
log.log("path desktop:", app.getPath("desktop"));
log.log("path documents:", app.getPath("documents"));
log.log("path downloads:", app.getPath("downloads"));
log.log("path music:", app.getPath("music"));
log.log("path pictures:", app.getPath("pictures"));
log.log("path videos:", app.getPath("videos"));
log.log("path logs:", app.getPath("logs"));

const ENV = process.env.NODE_ENV || "prod";

log.log("init app with env:", ENV);


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
  log.log("create win");
  const win = new BrowserWindow({
    width: 682,
    height: 432,
    webPreferences: {
      nodeIntegration: true
    },
    frame: false,
  })

  log.log("created window:", win.id);

//  win.on('show', () => {
//    log.log("on show");
//    setTimeout(() => {
//      log.log("win focus");
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
    log.log("no windows, create one");
    createWindow()
  }else{
    log.log("active existed window");
    BrowserWindow.getAllWindows().forEach(win => {
      log.log("show window:", win.id);
      win.show();
    });
  }
}

function closeWindow(){
  if (BrowserWindow.getAllWindows().length === 0) {
    log.log("no windows");
  }else{
    BrowserWindow.getAllWindows().forEach(win => {
      log.log("close window:", win.id);
      win.hide();
    });
  }
}

ipcMain.on("close-window", e => {
  log.log("ipc close window");
  closeWindow();
});

ipcMain.handle("cal", async (e, a) => {
  log.log("cal:", e, a);
  //try to calculate
  try{
    const result = eval(a);
    const calResult = parseFloat(result);
    if(calResult){
      log.log("cal:", calResult);
      return calResult
    }
  }catch(e){
    log.log("fail:", e);
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
  log.log("ipc close window");
  closeWindow();
});

app.whenReady().then(() => {
  log.log("ready");
  createWindow();
})

//app.on('window-all-closed', () => {
//  if (process.platform !== 'darwin') {
//    app.quit()
//  }
//})
//

app.on('activate', () => {
  log.log("on active");
  if (BrowserWindow.getAllWindows().length === 0) {
    log.log("create in active");
    createWindow()
  }
})

app.on('ready', async () => {
  log.log("on ready");
  
  //shortcut
//  globalShortcut.register('Ctrl+Shift+Alt+D', () => {
//  globalShortcut.register('Alt+D', () => {
  globalShortcut.register('Option+Space', () => {
    log.log("press")
    activeApp();
  });

  //tray icon
  const iconName = 'iconTemplate.png';//'b2.jpg'
  const iconPath = path.join(__dirname, iconName)
  appIcon = new Tray(iconPath)

  //dock icon
  app.dock.hide();

  const contextMenu = Menu.buildFromTemplate([{
    label: `Open Dadiorapp ${package.version}`,
    click: () => {
      activeApp()
    }
  }])

  appIcon.setToolTip('Dadiorapp')
  appIcon.setContextMenu(contextMenu)

  const appDataDirectory = app.getPath('userData');
  let dbFilePath = appDataDirectory + '/data/';
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev') {
    dbFilePath = path.join(__dirname, 'data');
    log.log("is dev mode, use current path");
  }
  log.info('NODE_ENV:%s, dbFilePath:%s', process.env.NODE_ENV, dbFilePath);
  if (!fs.existsSync(dbFilePath)){
    log.log("The path don't exist, create it");
    fs.mkdirSync(dbFilePath);
  }
  await appModel.init(dbFilePath);

//  setTimeout(() => {
//    showNotification("xxxxxxxx", function(){
//      log.warn("closed");
//    });
//  }, 1000);
//

});

//app.on('window-all-closed', () => {
//  if (appIcon) appIcon.destroy()
//})

