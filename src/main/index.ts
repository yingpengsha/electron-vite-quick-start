import electron from 'electron'

const {
  app,
  BrowserWindow
} = electron

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({ 
    width: 800,
    height: 600
  })

  mainWindow.loadURL(process['env'].RENDERER_URL || 'http://localhost:3000')

  mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
