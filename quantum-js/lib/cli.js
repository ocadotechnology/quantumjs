'use strict'
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

const chalk = require('chalk')
const path = require('path')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const liveserver = require('live-server')

const qwatch = require('./watch')
const read = require('./read')
const Page = require('./page')
const fileOptions = require('./file-options')
const version = require('../package.json').version

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
  const start = Date.now()
  return pipeline(sourcePage, config)
    .then((pages) => Array.isArray(pages) ? pages : [pages])
    .map((page) => fs.outputFileAsync(page.file.dest, page.content).then(() => page))
    .then((destPages) => {
      const timeTaken = Date.now() - start
      logger({type: 'build-page', timeTaken: timeTaken, sourcePage: sourcePage, destPages: destPages})
      return destPages
    })
    .catch((err) => logger({type: 'error', error: err}))
}

function copyResource (file, logger) {
  const start = Date.now()
  return fs.copyAsync(file.src, file.dest).then(() => {
    const timeTaken = Date.now() - start
    return logger({type: 'copy-resource', file: file, timeTaken: timeTaken})
  })
}

function copyResources (config, options, logger) {
  logger({type: 'header', message: 'Copying Resources'})
  return fileOptions.resolve(config.resources, options)
    .map((file) => copyResource(file, logger), {concurrency: options.concurrency})
}

function build (config) {
  const logger = config.logger
  const options = {concurrency: config.concurrency || 1, dest: config.dest}
  const pipeline = config.pipeline

  return copyResources(config, options, logger).then(() => {
    logger({type: 'header', message: 'Building Pages'})
    return fileOptions.resolve(config.pages, options).map((file) => {
      return read(file.src)
        .then((content) => {
          const page = new Page({
            file: file,
            content: content
          })
          return buildPage(page, pipeline, config, logger)
        })
        .catch((err) => {
          if (err.type === 'quantum-parse') {
            logger({type: 'page-load-error', file: file.src, error: err})
          } else {
            throw err
          }
        })
    }, {concurrency: options.concurrency})
  }).then(() => logger({type: 'end'}))
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
  const logger = config.logger
  const options = {concurrency: config.concurrency || 1, dest: config.dest || 'target', port: config.port || 8080}
  const pipeline = config.pipeline

  logger({type: 'header', message: 'Starting Server'})
  logger({type: 'message', message: 'http://0.0.0.0:' + options.port})
  startServer(options)

  copyResources(config, options, logger).then(() => {
    logger({type: 'header', message: 'Building Site'})
    qwatch(config.pages, options, (err, page) => {
      if (err) {
        logger({type: 'page-load-error', file: page.file.src, error: err})
      } else {
        return buildPage(page, pipeline, config, logger)
      }
    })

    qwatch.watcher(config.resources, options).then((watcher) => {
      watcher.on('change', (file) => copyResource(file, logger))
    })
  })
}

function list (config) {
  const htmlTransforms = config.htmlTransforms

  if (htmlTransforms) {
    Object.keys(htmlTransforms).forEach((namespace) => {
      console.log(chalk.yellow(namespace))
      Object.keys(htmlTransforms[namespace]).forEach((entity) => {
        console.log(chalk.cyan('  @' + entity) + chalk.gray(' (@' + namespace + '.' + entity + ')'))
      })
    })
  } else {
    console.log(chalk.yellow('htmlTransforms has not been exported in the quantum.config.js'))
  }
}

const commands = {
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
    evt.sourcePage.warnings.forEach((warning) => {
      console.log(chalk.yellow('  [warning] ') + chalk.cyan(warning.module) + ': ' + chalk.yellow(warning.problem) + '.  ' + warning.resolution)
    })
    evt.sourcePage.errors.forEach((error) => {
      console.log(chalk.red('  [error] ') + chalk.cyan(error.module) + ': ' + chalk.yellow(error.problem) + '.  ' + error.resolution)
    })
    evt.destPages.forEach((page) => {
      console.log(chalk.green('  + ' + page.file.dest))
      page.warnings.forEach((warning) => {
        console.log(chalk.yellow('  [warning] ') + chalk.cyan(warning.module) + ': ' + chalk.yellow(warning.problem) + '.  ' + warning.resolution)
      })
      page.errors.forEach((error) => {
        console.log(chalk.red('  [error] ') + chalk.cyan(error.module) + ': ' + chalk.yellow(error.problem) + '.  ' + error.resolution)
      })
    })
  } else if (evt.type === 'page-load-error') {
    console.log(evt.file)
    const context = evt.file !== evt.error.filename ? 'in inlined file ' + chalk.cyan(evt.error.filename) + ': ' : ''
    const errorMessage = evt.error.toString().split('\n').map((line, i) => (i > 0 ? '  ' : '') + line).join('\n')
    console.log(chalk.red('  [error] ' + context + errorMessage))
  } else if (evt.type === 'copy-resource') {
    console.log(evt.file.src + chalk.magenta(' [' + evt.timeTaken + ' ms]' + chalk.gray(' -> ' + evt.file.dest)))
  } else if (evt.type === 'error') {
    console.error(evt.error.stack || evt.error)
  } else if (evt.type === 'end') {
    // console.log('Rendered ' + count + ' pages')
  }
}

function cli () {
  const silent = process.argv.find((arg) => arg === '--silent' || arg === '-s') !== undefined
  const command = process.argv.find((arg) => arg === 'build' || arg === 'watch' || arg === 'list')

  const customConfigFile = process.argv.find((arg) => arg.startsWith('--config='))
  const configFile = customConfigFile ? customConfigFile.slice(9) : 'quantum.config.js'

  if (command) {
    // XXX: check if the config file exists and print a friendly warning if not
    const config = require(path.relative(__dirname, path.resolve(configFile)))
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
