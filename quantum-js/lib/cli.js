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

const { cyan, yellow, green, red } = chalk

const helpString = `
${cyan('Usage:')}

  ${yellow.bold('quantum build')} ${green('--config=<filename> --loglevel=<none|error>')}
    Builds the quantum site in the current folder. Looks for quantum.config.js
    in the current directory by default.

    ${cyan('Examples:')}
      quantum build
      quantum build --config=quantum.production.config.js
      quantum build --loglevel=error

  ${yellow.bold('quantum watch')} ${green('--config=<filename> --loglevel=<none|error> --port=<8080>')}
    Builds the quantum site in the current folder then watches for changes in
    the source, rebuilding every time there is a change.

    ${cyan('Examples:')}
      quantum watch
      quantum watch --config=quantum.production.config.js
      quantum watch --loglevel=error
      quantum watch --port=9000

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

function findArg (args, argToFind) {
  const argString = `--${argToFind}=`
  const foundArg = args.find(arg => arg.startsWith(argString))
  return foundArg ? foundArg.slice(argString.length) : undefined
}

function parseArgs (args) {
  const command = args[2]

  // Show help if using `quantum --help` (or options before command)
  if (command.indexOf('-') === 0) {
    return {}
  } else {
    const configPath = path.resolve(findArg(args, 'config') || 'quantum.config.js')

    try {
      const config = require(path.relative(__dirname, configPath))

      // Set options from command line (e.g. --port=)
      config.port = findArg(args, 'port') || config.port
      config.logLevel = findArg(args, 'loglevel') || config.logLevel

      return { command, config }
    } catch (e) {
      return { error: `Config file not found: ${configPath}` }
    }
  }
}

module.exports = () => {
  const { error, command, config } = parseArgs(process.argv)

  if (error) {
    console.error(`
${red(error)}
See ${cyan('quantum --help')} for usage information
    `)
  } else if (command in commands) {
    commands[command](config)
  } else {
    printHelp()
  }
}
