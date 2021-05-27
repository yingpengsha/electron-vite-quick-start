const path = require('path')
const chalk = require('chalk')
const electron = require('electron')
const {
  spawn
} = require('child_process')
const {
  createServer,
  createLogger,
  build
} = require('vite')

let manualRestart
const MAIN_ROOT = path.resolve(__dirname, '../src/main')
const RENDERER_ROOT = path.resolve(__dirname, '../src/renderer')

async function startRenderer() {
  try {
    const viteServer = await createServer({
      root: RENDERER_ROOT
    })
    await viteServer.listen()
    return viteServer
  } catch (error) {
    createLogger().error(
      chalk.red(`error when starting dev server:\n${error.stack}`)
    )
  }
}

async function buildMainProcess() {
  try {
    const rollupWatcher = await build({
      root: MAIN_ROOT,
      build: {
        watch: true
      }
    })
    return rollupWatcher
  } catch (error) {
    createLogger().error(
      chalk.red(`error during build main process:\n${error.stack}`)
    )
    process.exit(1)
  }
}

function startElectron(RENDERER_URL) {
  let args = [
    '--inspect=5858',
    path.join(__dirname, '../dist/main.cjs.js'),
  ]

  // detect yarn or npm and process commandline args accordingly
  if (process.env.npm_execpath.endsWith('yarn.js')) {
    args = args.concat(process.argv.slice(3))
  } else if (process.env.npm_execpath.endsWith('npm-cli.js')) {
    args = args.concat(process.argv.slice(2))
  }

  const electronProcess = spawn(electron, args, {env: {
    RENDERER_URL
  }})

  electronProcess.on('close', () => {
    if (!manualRestart) process.exit()
  })
  
  return electronProcess
}

async function start() {
  const rendererServer = await startRenderer()
  const { port = 3000, https = false} = rendererServer.config.server
  const RENDERER_URL = `http${https ? 's' : ''}://localhost:${port}`
  
  const mainWatcher = await buildMainProcess()
  let electronProcess = startElectron(RENDERER_URL)

  mainWatcher.on('change', () => {
    if (electronProcess && electronProcess.kill) {
      manualRestart = true
      process.kill(electronProcess.pid)
      electronProcess = null
      startElectron(RENDERER_URL)

      setTimeout(() => {
        manualRestart = false
      }, 5000)
    }
  })

  electronProcess.on('close', () => {
    mainWatcher.close()
  })
}

start()
