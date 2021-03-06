'use strict'
/*

  Api
  ===

  Defines the main entry points for using quantum (build and watch)

*/

const path = require('path')
const chalk = require('chalk')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const connect = require('connect')
const serveStatic = require('serve-static')
const compression = require('compression')
const ws = require('ws')

const qwatch = require('./watch')
const { ParseError } = require('./parse')
const fileOptions = require('./file-options')
const { defaultLoader, readAsFile } = require('./read')

const liveReloadScriptTag = fs.readFileSync(path.join(__dirname, '..', 'assets', 'live-reload.html'))

/* Pretty prints the log events to the console */
function defaultLogger (evt) {
  if (evt.type === 'header') {
    console.log(chalk.underline('\n' + evt.message))
  } else if (evt.type === 'message') {
    console.log(evt.message)
  } else if (evt.type === 'build-page') {
    // Pages are html, files are everything else
    const destPages = evt.destFiles.filter(({ info: { dest } }) => path.extname(dest) === '.html')
    const destFiles = evt.destFiles.filter(({ info: { dest } }) => path.extname(dest) !== '.html')

    const pagesString = destPages.length ? destPages.length + ' page' + (destPages.length !== 1 ? 's' : '') : ''
    const filesString = destFiles.length ? (destPages.length ? ', ' : '') + destFiles.length + ' file' + (destFiles.length !== 1 ? 's' : '') : ''

    console.log(evt.sourceFile.info.src + chalk.magenta(' [' + evt.timeTaken + ' ms]') + chalk.dim(' -> ' + pagesString + filesString))
    // Added output logging for individual pages
    if (destPages.length < 5) {
      destPages.forEach(page => {
        console.log(chalk.cyan('  +', page.info.dest))
      })
    }
    evt.sourceFile.warnings.forEach((warning) => {
      console.log(chalk.yellow('  [warning] ') + chalk.cyan(warning.module) + ': ' + chalk.yellow(warning.problem) + '.  ' + warning.resolution)
    })
    evt.sourceFile.errors.forEach((error) => {
      console.log(chalk.red('  [error] ') + chalk.cyan(error.module) + ': ' + chalk.yellow(error.problem) + '.  ' + error.resolution)
    })
  } else if (evt.type === 'page-load-error') {
    console.log(evt.file)
    const context = evt.file !== evt.error.filename ? 'in inlined file ' + chalk.cyan(evt.error.filename) + ': ' : ''
    const errorMessage = evt.error.toString().split('\n').map((line, i) => (i > 0 ? '  ' : '') + line).join('\n')
    console.log(chalk.red('  [error] ' + context + errorMessage))
  } else if (evt.type === 'copy-resource') {
    console.log(evt.fileInfo.src + chalk.magenta(` [${evt.timeTaken} ms]`) + chalk.gray(` -> ${evt.fileInfo.dest}`))
  } else if (evt.type === 'error') {
    console.error(evt.error.stack || evt.error)
  } else if (evt.type === 'end') {
    console.log()
    console.log('Built ' + evt.builtCount + ' pages ' + chalk.magenta('[' + (evt.timeTaken / 1000).toFixed(2) + ' s]'))
  }
}

/* Builds a single file using the pipine provided */
function buildPage (sourceFile, pipeline, config, logger, addLiveReload) {
  const start = Date.now()
  return Promise.resolve(pipeline(sourceFile))
    .then(files => Array.isArray(files) ? files : [files])
    .then(files => Array.from(new Map(files.map(f => [f.info.dest, f])).values()))
    .map(file => {
      const shouldInjectLiveReloadScript = addLiveReload &&
        file.info.dest.indexOf('.html') === file.info.dest.length - 5

      const content = shouldInjectLiveReloadScript
        ? file.content.replace('</body>', liveReloadScriptTag + '</body>')
        : file.content

      return fs.outputFileAsync(file.info.dest, content)
        .then(() => file)
    })
    .then((destFiles) => {
      const timeTaken = Date.now() - start
      logger({ type: 'build-page', timeTaken: timeTaken, sourceFile: sourceFile, destFiles: destFiles })
      return destFiles
    })
    .catch((err) => logger({ type: 'error', error: err }))
}

function copyResource (fileInfo, logger) {
  const start = Date.now()
  return fs.copyAsync(fileInfo.src, fileInfo.dest).then(() => {
    const timeTaken = Date.now() - start
    return logger({ type: 'copy-resource', fileInfo: fileInfo, timeTaken: timeTaken })
  })
}

function copyResources (config, options, logger) {
  logger({ type: 'header', message: 'Copying Resources' })
  return fileOptions.resolve(config.resources || [], options)
    .map((fileInfo) => copyResource(fileInfo, logger), { concurrency: options.concurrency })
}

function flatten (arrays) {
  return Array.prototype.concat.apply([], arrays)
}

function createPipeline (entityTransforms) {
  return (file) => {
    let result = Promise.resolve([file])
    entityTransforms.forEach(transform => {
      result = result.then(files => {
        return Promise.all(files.map(transform)).then(flatten)
      })
    })
    return result
  }
}

function createFilteredLogger (log, logLevel) {
  if (logLevel === 'none') {
    return (evt) => {}
  } else if (logLevel === 'error') {
    return (evt) => {
      if (evt.type === 'error') {
        log(evt)
      }
    }
  } else {
    return (evt) => log(evt)
  }
}

function buildSpecs (startTime, specs, config, options, pipeline, logger) {
  const fileReader = config.fileReader || readAsFile
  const loader = config.loader || defaultLoader

  let builtCount = 0

  return fileOptions.resolve(specs, options).map((fileInfo) => {
    return fileReader(fileInfo, { loader, resolveRoot: options.resolveRoot })
      .then(file => buildPage(file, pipeline, config, logger, false)
        .then(files => {
          builtCount += files.length
          return files
        }))
      .catch((err) => {
        if (err instanceof ParseError) {
          logger({ type: 'page-load-error', file: fileInfo.src, error: err })
        } else {
          throw err
        }
      })
  }, { concurrency: options.concurrency })
    .then(() => logger({ type: 'end', builtCount: builtCount, timeTaken: Date.now() - startTime }))
}

function build (config) {
  const logger = createFilteredLogger(config.logger || defaultLogger, config.logLevel)
  const options = {
    concurrency: config.concurrency || 1,
    dest: config.dest,
    resolveRoot: path.resolve(config.resolveRoot || process.cwd())
  }
  const pipeline = createPipeline(config.pipeline)
  const startTime = Date.now()
  return copyResources(config, options, logger).then(() => {
    logger({ type: 'header', message: 'Building Pages' })
    return buildSpecs(startTime, config.pages, config, options, pipeline, logger)
  })
}

function startServer (options) {
  const server = require('http').createServer()
  const wss = new ws.Server({ server: server })
  const app = connect()

  const connections = new Set()

  wss.on('connection', (ws) => {
    connections.add(ws)
    ws.on('close', () => connections.delete(ws))
  })

  app.use(compression())
  app.use(serveStatic(options.dest))
  server.on('request', app)
  server.listen(options.port, '0.0.0.0', (err) => {
    if (err) {
      console.error(`Unable to start server: ${err}`)
    }
  })

  let currentTriggerTimeout = void (0)

  function triggerReload (filename) {
    // XXX: use the filename for more targeted reloads

    // Adds some debouncing - can be removed once targeted reloads are added
    clearTimeout(currentTriggerTimeout)
    currentTriggerTimeout = setTimeout(() => {
      connections.forEach(ws => {
        if (ws.readyState === ws.OPEN) {
          ws.send('reload')
        } else {
          connections.delete(ws)
        }
      })
    }, 100)
  }

  return triggerReload
}

function watch (config) {
  const logger = createFilteredLogger(config.logger || defaultLogger, config.logLevel)
  const options = {
    concurrency: config.concurrency || 1,
    dest: config.dest || 'target',
    port: config.port || 8080,
    fileReader: config.fileReader || readAsFile,
    loader: config.loader || defaultLoader,
    resolveRoot: path.resolve(config.resolveRoot || process.cwd()),
    serverEnabled: config.serverEnabled !== false,
    liveReload: config.liveReload !== false
  }
  const pipeline = createPipeline(config.pipeline)

  if (options.serverEnabled) {
    logger({ type: 'header', message: 'Starting Server' })
    logger({ type: 'message', message: 'http://0.0.0.0:' + options.port })
  }

  const serverTriggerReload = options.serverEnabled ? startServer(options) : undefined
  const triggerReload = options.liveReload ? serverTriggerReload : undefined

  return Promise.all(fileOptions.normalize(config.pages))
    .filter(spec => spec)
    .then(specs => {
      const watched = specs.filter(spec => spec.watch !== false)
      const unwatched = specs.filter(spec => spec.watch === false)

      return copyResources(config, options, logger).then(() => {
        return new Promise(resolve => {
          if (unwatched.length) {
            const startTime = Date.now()
            logger({ type: 'header', message: 'Building Unwatched Files' })
            resolve(buildSpecs(startTime, unwatched, config, options, pipeline, logger))
          } else {
            resolve()
          }
        }).then(() => {
          logger({ type: 'header', message: 'Building Watched Files' })
          function watchHandler (err, file) {
            if (err) {
              logger({ type: 'page-load-error', file: file.info.src, error: err })
            } else {
              return buildPage(file, pipeline, config, logger, options.liveReload)
                .then((files) => {
                  if (triggerReload) {
                    files.forEach(file => triggerReload(file.info.dest))
                  }
                })
            }
          }

          qwatch.watch(watched, watchHandler, options)

          if (config.resources) {
            qwatch.watcher(config.resources, options).then((watcher) => {
              watcher.on('change', (file) => {
                copyResource(file, logger)
                if (triggerReload) {
                  triggerReload(file.dest)
                }
              })
            })
          }
        })
      })
    })
}

module.exports = {
  build,
  watch
}
