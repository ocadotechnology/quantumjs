/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  CLI
  ===

  A command line interface for quantum.

*/

var chalk = require('chalk')
var path = require('path')
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))
var liveserver = require('live-server')

var qwatch = require('./watch')
var read = require('./read')
var Page = require('./page')
var fileOptions = require('./file-options')
var version = require('../package.json').version

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

    ${chalk.bold('quantum ')}${chalk.yellow.bold('help ')}${chalk.yellow.green('<entity>')}
      Displays this help information, or information about entities available.

      ${chalk.cyan('Examples')}
        quantum help
        quantum help docs.titlebar
  `)
}

function buildPage (sourcePage, pipeline, config, logger) {
  var start = Date.now()
  return pipeline(sourcePage, config)
    .then(function (pages) {
      return Array.isArray(pages) ? pages : [pages]
    })
    .map(function (page) {
      return fs.outputFileAsync(page.file.dest, page.content).then(function () {
        return page
      })
    })
    .then(function (destPages) {
      var timeTaken = Date.now() - start
      logger({type: 'build-page', timeTaken: timeTaken, sourcePage: sourcePage, destPages: destPages})
      return destPages
    })
    .catch(function (err) {
      logger({type: 'error', error: err})
    })
}

function copyResource (file, logger) {
  var start = Date.now()
  return fs.copyAsync(file.src, file.dest).then(function () {
    var timeTaken = Date.now() - start
    return logger({type: 'copy-resource', file: file, timeTaken: timeTaken})
  })
}

function copyResources (config, options, logger) {
  logger({type: 'header', message: 'Copying Resources'})
  return fileOptions.resolve(config.resources, options).map(function (file) {
    return copyResource(file, logger)
  }, {concurrency: options.concurrency})
}

function build (config) {
  var logger = config.logger
  var options = {concurrency: config.concurrency || 1, dest: config.dest}
  var pipeline = config.pipeline

  return copyResources(config, options, logger).then(function () {
    logger({type: 'header', message: 'Building Pages'})
    return fileOptions.resolve(config.pages, options).map(function (file) {
      return read(file.src)
        .then(function (content) {
          var page = new Page({
            file: file,
            content: content
          })
          return buildPage(page, pipeline, config, logger)
        })
    }, {concurrency: options.concurrency})
  }).then(function () {
    logger({type: 'end'})
  })
}

function startServer (options) {
  liveserver.start({
    port: options.port,
    host: '0.0.0.0',
    root: options.dest,
    open: false,
    wait: 0,
    quiet: true
  })
}

function watch (config) {
  var logger = config.logger
  var options = {concurrency: config.concurrency || 1, dest: config.dest || 'target', port: config.port || 8080}
  var pipeline = config.pipeline

  logger({type: 'header', message: 'Starting Server'})
  logger({type: 'message', message: 'http://0.0.0.0:' + options.port})
  startServer(options)

  copyResources(config, options, logger).then(function () {
    logger({type: 'header', message: 'Building Site'})
    qwatch(config.pages, options, function (page) {
      return buildPage(page, pipeline, config, logger)
    })

    qwatch.watcher(config.resources, options).then(function (watcher) {
      watcher.on('change', function (file) {
        return copyResource(file, logger)
      })
    })
  })
}

function list (config) {
  var htmlTransforms = config.htmlTransforms

  if (htmlTransforms) {
    Object.keys(htmlTransforms).forEach(function (namespace) {
      console.log(chalk.yellow(namespace))
      Object.keys(htmlTransforms[namespace]).forEach(function (entity) {
        console.log(chalk.cyan('  @' + entity) + chalk.gray(' (@' + namespace + '.' + entity + ')'))
      })
    })
  } else {
    console.log(chalk.yellow('htmlTransforms has not been exported in the quantum.config.js'))
  }
}

var commands = {
  build: build,
  watch: watch,
  list: list
}

function silentLogger (evt) {
  if (evt.type === 'error') {
    console.error(evt.error.stack || evt.error)
  }
}

function defaultLogger (evt) {
  if (evt.type === 'header') {
    console.log(chalk.underline('\n' + evt.message))
  } else if (evt.type === 'message') {
    console.log(evt.message)
  } else if (evt.type === 'build-page') {
    console.log(evt.sourcePage.file.src + chalk.magenta(' [' + evt.timeTaken + ' ms]'))
    evt.sourcePage.warnings.forEach(warning => {
      console.log(chalk.yellow('  [warning] ') + chalk.cyan(warning.module) + ': ' + chalk.yellow(warning.problem) + '.  ' + warning.resolution)
    })
    evt.sourcePage.errors.forEach(error => {
      console.log(chalk.red('  [error] ') + chalk.cyan(error.module) + ': ' + chalk.yellow(error.problem) + '.  ' + error.resolution)
    })
    evt.destPages.forEach(function (page) {
      console.log(chalk.green('  + ' + page.file.dest))
      page.warnings.forEach(warning => {
        console.log(chalk.yellow('  [warning] ') + chalk.cyan(warning.module) + ': ' + chalk.yellow(warning.problem) + '.  ' + warning.resolution)
      })
      page.errors.forEach(error => {
        console.log(chalk.red('  [error] ') + chalk.cyan(error.module) + ': ' + chalk.yellow(error.problem) + '.  ' + error.resolution)
      })
    })
  } else if (evt.type === 'copy-resource') {
    console.log(evt.file.src + chalk.magenta(' [' + evt.timeTaken + ' ms]' + chalk.gray(' -> ' + evt.file.dest)))
  } else if (evt.type === 'error') {
    console.error(evt.error.stack || evt.error)
  } else if (evt.type === 'end') {
    // console.log('Rendered ' + count + ' pages')
  }
}

function cli () {
  var silent = process.argv.find(arg => arg === '--silent' || arg === '-s') !== undefined
  var command = process.argv.find(arg => arg === 'build' || arg === 'watch' || arg === 'list')

  var customConfigFile = process.argv.find(arg => arg.startsWith('--config='))
  var configFile = customConfigFile ? customConfigFile.slice(9) : 'quantum.config.js'

  if (command) {
    // XXX: check if the config file exists and print a friendly warning if not
    var config = require(path.relative(__dirname, path.resolve(configFile)))
    config.logger = silent ? silentLogger : (config.logger || defaultLogger)
    commands[command](config)
  } else {
    help()
  }
}

module.exports = cli
module.exports.build = build
module.exports.watch = watch
module.exports.help = help
