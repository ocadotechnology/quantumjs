'use strict'
/*

  CLI
  ===

  A command line interface for quantum.

*/

const chalk = require('chalk')
const path = require('path')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const connect = require('connect')
const serveStatic = require('serve-static')
const compression = require('compression')
const ws = require('ws')

const qwatch = require('./watch')
const parse = require('./parse')
const read = require('./read').read
const File = require('./file')
const fileOptions = require('./file-options')
const version = require('../package.json').version

const liveReloadScriptTag = fs.readFileSync(path.join(__dirname, '..', 'assets', 'live-reload.html'))

function help () {
  console.log(`
QuantumJS (${version})

  ${chalk.cyan('Usage:')}

    quantum <command> [options]

  ${chalk.cyan('Commands:')}

    quantum [options] build
    quantum [options] watch
    quantum list
    quantum help <entity>

    ${chalk.cyan('Options:')}

      --config=<filename> - Sets the config file to use to build the site in the current directory.
                            By default this is "quantum.config.js"
      -s, --silent        - No logging when building.

    ${chalk.bold('quantum ')}${chalk.yellow.bold('build ')}${chalk.yellow.green('[options]')}
      Builds the quantum site in the current folder. By default it expects a config file
      called quantum.config.js to be in the current folder. The config file that quantum looks
      for can be configured with the --config option.

      ${chalk.cyan('Examples:')}
        quantum build
        quantum build --config=quantum.config.js

    ${chalk.bold('quantum ')}${chalk.yellow.bold('watch ')}${chalk.yellow.green('[options]')}
      Builds the quantum site in the current folder then watches for changes in the source,
      rebuilding every time there is a change. By default it expects a config file
      called quantum.config.js to be in the current folder. The config file that quantum looks
      for can be configured with the --config option.

      ${chalk.cyan('Examples:')}
        quantum watch
        quantum watch --config=quantum.config.js

    ${chalk.bold('quantum ')}${chalk.yellow.bold('list')}
      Lists out the available entities
  `)
}

function buildPage (sourceFile, pipeline, config, logger, addLiveReload) {
  const start = Date.now()
  return Promise.resolve(pipeline(sourceFile))
    .then((files) => Array.isArray(files) ? files : [files])
    .map((file) => {
      let content = file.content
      if (addLiveReload && file.info.dest.indexOf('.html') === file.info.dest.length - 5) {
        content = content.replace('</body>', liveReloadScriptTag + '</body>')
      }
      return fs.outputFileAsync(file.info.dest, content).then(() => file)
    })
    .then((destFiles) => {
      const timeTaken = Date.now() - start
      logger({type: 'build-page', timeTaken: timeTaken, sourceFile: sourceFile, destFiles: destFiles})
      return destFiles
    })
    .catch((err) => logger({type: 'error', error: err}))
}

function copyResource (fileInfo, logger) {
  const start = Date.now()
  return fs.copyAsync(fileInfo.src, fileInfo.dest).then(() => {
    const timeTaken = Date.now() - start
    return logger({type: 'copy-resource', fileInfo: fileInfo, timeTaken: timeTaken})
  })
}

function copyResources (config, options, logger) {
  logger({type: 'header', message: 'Copying Resources'})
  return fileOptions.resolve(config.resources || [], options)
    .map((fileInfo) => copyResource(fileInfo, logger), {concurrency: options.concurrency})
}

function flatten (arrays) {
  return Array.prototype.concat.apply([], arrays)
}

function createPipeline (transforms) {
  return (file) => {
    let result = Promise.resolve([file])
    transforms.forEach(transform => {
      result = result.then(files => {
        return Promise.all(files.map(transform)).then(flatten)
      })
    })
    return result
  }
}

function silentLogger (logger) { return (evt) => {} }

function errorLogger (logger) {
  return (evt) => {
    if (evt.type === 'error') {
      logger(evt)
    }
  }
}

function allLogger (logger) {
  return (evt) => logger(evt)
}

function getLoggerWrapper (config) {
  switch (config.loglevel) {
    case 'none':
      return silentLogger
    case 'error':
      return errorLogger
    default:
      return allLogger
  }
}

function build (config) {
  const logger = getLoggerWrapper(config)(config.logger || defaultLogger)
  const options = {concurrency: config.concurrency || 1, dest: config.dest}
  const pipeline = createPipeline(config.pipeline)

  let builtCount = 0
  const startTime = Date.now()
  return copyResources(config, options, logger).then(() => {
    logger({type: 'header', message: 'Building Pages'})
    return fileOptions.resolve(config.pages, options).map((fileInfo) => {
      return read(fileInfo.src)
        .then((content) => {
          const file = new File({
            info: fileInfo,
            content: content
          })
          return buildPage(file, pipeline, config, logger, false)
            .then(files => {
              builtCount += files.length
              return files
            })
        })
        .catch((err) => {
          if (err instanceof parse.ParseError) {
            logger({type: 'page-load-error', fileInfo: fileInfo.src, error: err})
          } else {
            throw err
          }
        })
    }, {concurrency: options.concurrency})
  }).then(() => logger({type: 'end', builtCount: builtCount, timeTaken: Date.now() - startTime}))
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
      console.error('Unable to start server: ' + err)
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
  const logger = getLoggerWrapper(config)(config.logger || defaultLogger)
  const options = {concurrency: config.concurrency || 1, dest: config.dest || 'target', port: config.port || 8080}
  const pipeline = createPipeline(config.pipeline)

  logger({type: 'header', message: 'Starting Server'})
  logger({type: 'message', message: 'http://0.0.0.0:' + options.port})
  const triggerReload = startServer(options)

  copyResources(config, options, logger).then(() => {
    logger({type: 'header', message: 'Building Site'})
    qwatch(config.pages, options, (err, file) => {
      if (err) {
        logger({type: 'page-load-error', fileInfo: file.info.src, error: err})
      } else {
        return buildPage(file, pipeline, config, logger, true)
          .then((files) => {
            files.forEach(file => triggerReload(file.info.dest))
          })
      }
    })

    if (config.resources) {
      qwatch.watcher(config.resources, options).then((watcher) => {
        watcher.on('change', (file) => {
          copyResource(file, logger)
          triggerReload(file.dest)
        })
      })
    }
  })
}

function list (config) {
  const entityTransforms = config.pipeline.map(x => x.entityTransforms).filter(x => x !== undefined)[0]

  if (entityTransforms) {
    Object.keys(entityTransforms).forEach((namespace) => {
      console.log(chalk.yellow(namespace))
      Object.keys(entityTransforms[namespace]).forEach((entity) => {
        console.log(chalk.cyan('  @' + entity) + chalk.gray(' (@' + namespace + '.' + entity + ')'))
      })
    })
  } else {
    console.log(chalk.yellow('No entity transforms are present in your pipeline'))
  }
}

const commands = {
  build: build,
  watch: watch,
  list: list
}

function defaultLogger (evt) {
  if (evt.type === 'header') {
    console.log(chalk.underline('\n' + evt.message))
  } else if (evt.type === 'message') {
    console.log(evt.message)
  } else if (evt.type === 'build-page') {
    console.log(evt.sourceFile.info.src + chalk.magenta(' [' + evt.timeTaken + ' ms]') + chalk.gray(' -> ' + evt.destFiles.length + ' page' + (evt.destFiles.length > 1 ? 's' : '')))
    evt.sourceFile.warnings.forEach((warning) => {
      console.log(chalk.yellow('  [warning] ') + chalk.cyan(warning.module) + ': ' + chalk.yellow(warning.problem) + '.  ' + warning.resolution)
    })
    evt.sourceFile.errors.forEach((error) => {
      console.log(chalk.red('  [error] ') + chalk.cyan(error.module) + ': ' + chalk.yellow(error.problem) + '.  ' + error.resolution)
    })
    // if(evt.destFiles.length < 4) {
    //   evt.destFiles.forEach((page) => {
    //     console.log(chalk.green('  + ' + page.file.dest))
    //     page.warnings.forEach((warning) => {
    //       console.log(chalk.yellow('  [warning] ') + chalk.cyan(warning.module) + ': ' + chalk.yellow(warning.problem) + '.  ' + warning.resolution)
    //     })
    //     page.errors.forEach((error) => {
    //       console.log(chalk.red('  [error] ') + chalk.cyan(error.module) + ': ' + chalk.yellow(error.problem) + '.  ' + error.resolution)
    //     })
    //   })
    // }
  } else if (evt.type === 'page-load-error') {
    console.log(evt.file)
    const context = evt.file !== evt.error.filename ? 'in inlined file ' + chalk.cyan(evt.error.filename) + ': ' : ''
    const errorMessage = evt.error.toString().split('\n').map((line, i) => (i > 0 ? '  ' : '') + line).join('\n')
    console.log(chalk.red('  [error] ' + context + errorMessage))
  } else if (evt.type === 'copy-resource') {
    console.log(evt.fileInfo.src + chalk.magenta(' [' + evt.timeTaken + ' ms]') + chalk.gray(' -> ' + evt.fileInfo.dest))
  } else if (evt.type === 'error') {
    console.error(evt.error.stack || evt.error)
  } else if (evt.type === 'end') {
    console.log()
    console.log('Built ' + evt.builtCount + ' pages ' + chalk.magenta('[' + (evt.timeTaken / 1000).toFixed(2) + ' s]'))
  }
}

function cli () {
  const command = process.argv.find((arg) => arg === 'build' || arg === 'watch' || arg === 'list')
  const loglevel = process.argv.find((arg) => arg.startsWith('--loglevel='))

  const port = command === 'watch' ? process.argv.find((arg) => arg.startsWith('--port=')) : undefined

  const customConfigFile = process.argv.find((arg) => arg.startsWith('--config='))
  const configFile = customConfigFile ? customConfigFile.slice(9) : 'quantum.config.js'

  if (command) {
    // XXX: check if the config file exists and print a friendly warning if not
    const config = require(path.relative(__dirname, path.resolve(configFile)))
    config.port = port ? port.slice(7) : config.port
    config.loglevel = loglevel ? loglevel.slice(11) : config.loglevel
    commands[command](config)
  } else {
    help()
  }
}

module.exports = cli
module.exports.build = build
module.exports.watch = watch
module.exports.help = help
