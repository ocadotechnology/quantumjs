'use strict'
/*

  CLI
  ===

  A command line interface for quantum.

*/

const chalk = require('chalk')
const path = require('path')
const api = require('./api')

const version = require('../package.json').version

const {cyan, yellow, green, bold} = chalk

const helpString = `
${cyan('Usage:')}

  ${yellow.bold('quantum build')} ${green('--config=<filename> --loglevel=<none|error>')}
    Builds the quantum site in the current folder. Looks for quantum.config.js
    in the current directory by default.

    ${cyan('Examples:')}
      quantum build
      quantum build --config=quantum.production.config.js
      quantum build --loglevel=none
      quantum build --loglevel=error

  ${yellow.bold('quantum watch')} ${green('--config=<filename> --loglevel=<none|error> --port=<8080>')}
    Builds the quantum site in the current folder then watches for changes in
    the source, rebuilding every time there is a change.

    ${cyan('Examples:')}
      quantum watch
      quantum watch --config=quantum.production.config.js
      quantum watch --loglevel=none
      quantum watch --loglevel=error

  ${yellow.bold('quantum list')}
    Lists out the entities available to use

  ${yellow.bold('quantum version')}
    Prints the quantum-js version
`

function logKeys (entity, entityName, entityNamespace, indent = 0) {
  if (typeof entity === 'function') {
    console.log(chalk.cyan(' '.repeat(indent) + '@' + entityName) + chalk.gray(' (@' + entityNamespace + ')'))
  } else {
    console.log(' '.repeat(indent) + chalk.yellow(entityName))
    Object.keys(entity).forEach((key) => {
      const newNamespace = entityNamespace + '.' + key
      logKeys(entity[key], key, newNamespace, indent + 2)
    })
  }
}

function list (config) {
  const entityTransforms = config.pipeline.map(x => x.entityTransforms).filter(x => x !== undefined)[0]
  if (entityTransforms) {
    Object.keys(entityTransforms).forEach(entityName => {
      logKeys(entityTransforms[entityName], entityName, entityName)
    })
  } else {
    console.log(chalk.yellow('No entity transforms are present in your pipeline'))
  }
}

function printVersion () {
  console.log(version)
}

function printHelp () {
  console.log(helpString)
}

const commands = {
  build: api.build,
  watch: api.watch,
  list: list,
  version: printVersion
}

function parseArgs (args) {
  const command = args[2]
  const logLevel = args.find((arg) => arg.startsWith('--loglevel='))
  const port = args.find((arg) => arg.startsWith('--port='))

  const customConfigFile = args.find((arg) => arg.startsWith('--config='))
  const configFile = customConfigFile ? customConfigFile.slice(9) : 'quantum.config.js'

  if (configFile) {
    const config = require(path.relative(__dirname, path.resolve(configFile)))
    config.port = port ? port.slice(7) : config.port
    config.logLevel = logLevel ? logLevel.slice(11) : config.logLevel

    return { command, config }
  }
}

module.exports = () => {
  const { command, config } = parseArgs(process.argv)

  if (command in commands) {
    commands[command](config)
  } else {
    printHelp()
  }
}
