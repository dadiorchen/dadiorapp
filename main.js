const path = require('path')

//auto reload
try {
	require('electron-reloader')(module);
} catch (_) {}

const { app, BrowserWindow, globalShortcut, Menu, Tray} = require('electron')


function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadFile('index.html')
}

function activeApp(){
  if (BrowserWindow.getAllWindows().length === 0) {
    console.log("no windows, create one");
    createWindow()
  }else{
    console.log("active existed window");
    BrowserWindow.getAllWindows().forEach(win => {
      win.show();
    });
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('ready', () => {
  
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

app.on('window-all-closed', () => {
  if (appIcon) appIcon.destroy()
})