import * as path from 'path'
import { app, BrowserWindow } from 'electron'

const loadURL = import.meta.env.PROD
  ? `file://${path.resolve(__dirname, '../renderer/index.html')}`
  : process['env'].RENDERER_URL || 'http://localhost:3000'

function createWindow() {
  const mainWindow = new BrowserWindow({ 
    width: 800,
    height: 600
  })

  mainWindow.loadURL(loadURL)

  // mainWindow.webContents.openDevTools()
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
