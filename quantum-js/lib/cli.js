
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

function help () {
  console.log(`
QuantumJS (${version})

  ${chalk.cyan('Usage:')}

    quantum <command> [options]

  ${chalk.cyan('Commands:')}

    quantum [options] build
    quantum [options] watch
    quantum list

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

const commands = {
  build: api.build,
  watch: api.watch,
  list: api.list
}

module.exports = () => {
  const command = process.argv[2]
  const logLevel = process.argv.find((arg) => arg.startsWith('--loglevel='))
  const port = process.argv.find((arg) => arg.startsWith('--port='))

  const customConfigFile = process.argv.find((arg) => arg.startsWith('--config='))
  const configFile = customConfigFile ? customConfigFile.slice(9) : 'quantum.config.js'

  if (command in commands) {
    // XXX: check if the config file exists and print a friendly warning if not
    const config = require(path.relative(__dirname, path.resolve(configFile)))
    config.port = port ? port.slice(7) : config.port
    config.logLevel = logLevel ? logLevel.slice(11) : config.logLevel
    commands[command](config)
  } else {
    help()
  }
}
