const path = require('path')

//auto reload
try {
	require('electron-reloader')(module);
} catch (_) {}

const { ipcMain, app, BrowserWindow, globalShortcut, Menu, Tray} = require('electron')

console.log("process.env.NODE_ENV:", process.env.NODE_ENV);

const ENV = process.env.NODE_ENV || "prod";

console.log("init app with env:", ENV);



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

app.on('ready', () => {
  console.log("on ready");
  
  //shortcut
  globalShortcut.register('Ctrl+Shift+Alt+D', () => {
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
    label: 'Open Dadiorapp',
    click: () => {
      activeApp()
    }
  }])

  appIcon.setToolTip('Dadiorapp')
  appIcon.setContextMenu(contextMenu)

});

//app.on('window-all-closed', () => {
//  if (appIcon) appIcon.destroy()
//})

