'use strict'
/*

  CLI
  ===

  A command line interface for quantum.

*/
const chalk = require('chalk')
const path = require('path')
const { readConfig, build, watch, list } = require('../lib/api')

const aliases = {
  cfg: 'config'
}

function removeAliases (apiFn) {
  return (cmdOpts) => {
    const convertedOpts = Object.keys(cmdOpts).reduce((converted, key) => {
      converted[aliases[key] || key] = cmdOpts[key]
      return converted
    }, {})
    return apiFn(readConfig(convertedOpts))
  }
}

const allOptions = {
  config:{
    alias: 'cfg',
    default: 'quantum.config.js',
    desc: 'Sets the config file to use to build the site in the current directory'
  },
  port: {
    desc: 'Specify the port to use when watching',
    default: 8080
  },
  logLevel: {
    desc: 'Specify the level of logging to use when building',
    choices: [
      'none',
      'error',
      'default'
    ]
  }
}

module.exports = () => {
  return require('yargs')
    .usage('$0 <cmd> [args]')
    .command({
      command: 'build',
      desc: 'Builds the quantum site in the current folder',
      builder: {
        config: allOptions.config,
        logLevel: allOptions.logLevel
      },
      handler: removeAliases(build)
    })
    .command({
      command: 'watch',
      builder: {
        config: allOptions.config,
        logLevel: allOptions.logLevel,
        port: allOptions.port
      },
      desc: 'Build and watch the quantum site in the current folder',
      handler: removeAliases(watch)
    })
    .command({
      command: 'list',
      desc: 'Lists the available entities in the current folder',
      builder: {
        config: allOptions.config
      },
      handler: removeAliases(list)
    })
    .version()
    .demandCommand(1, 'Please use one of the available commands')
    .help('help', 'Show help. For command help use <cmd> --help')
    .argv
}
