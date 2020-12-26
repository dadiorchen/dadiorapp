//auto reload
try {
	require('electron-reloader')(module);
} catch (_) {}

const { app, BrowserWindow, globalShortcut} = require('electron')

let isOpen = true;

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
  globalShortcut.register('Ctrl+Shift+Alt+D', () => {
    console.log("press")
    if (BrowserWindow.getAllWindows().length === 0) {
      console.log("no windows, create one");
      createWindow()
    }else{
      console.log("active existed window");
      BrowserWindow.getAllWindows().forEach(win => {
        win.show();
      });
    }
  });

});
