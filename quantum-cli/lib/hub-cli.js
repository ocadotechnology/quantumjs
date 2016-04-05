/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  CLI
  ===

  This file wraps the client library in a command line tool. This command line tool
  is used for working on the docs locally and for publishing them to a central hub.

*/

var program = require('commander')
var chalk = require('chalk')
var merge = require('merge')
var path = require('path')
var fs = require('fs')

var client = require('./client')

function fileExists (filePath) {
  try {
    return fs.statSync(filePath).isFile()
  } catch (err) {
    return false
  }
}

function checkConfigExists () {
  if (!fileExists('quantum.json')) {
    console.log(chalk.red('Error: ') + chalk.yellow('quantum.json') + ' not found in the current directory')
    return false
  } else {
    return true
  }
}

function exitInError (err) {
  console.error(chalk.red(err.stack || err))
  process.exit(1)
}

module.exports = function (opts) {
  var options = merge({
    pipeline: undefined, // a function that can build a page.
    resourceDir: undefined, // resources that the cli will copy to the target directory
    htmlTransforms: undefined, // include to enable the `entities` command (optional but recommended for hub setups)
    includeServerCommands: false, // whether or not to enable the init, publish and set-revision commands
    ca: undefined, // the certificate authority to trust when pushing to a hub (optional)
    version: '0.1.0' // the version of the cli tool - probably best to load this in from your package.json
  }, opts)

  program
    .version(options.version)
    .description('A command line tool for building a website using quantum.js')

  program
    .command('build')
    .description('builds the project')
    .option('-o, --output [output]', 'The directory to output to', 'target')
    .option('-q, --quiet', 'Only log errors', false)
    .option('-s, --progress', 'Use progressbars instead of detailed logging', false)
    .option('-c, --build-concurrency', 'How many pages to build in parallel')
    .action(function (cliOptions) {
      if (!checkConfigExists()) return process.exit(2)

      var cwd = process.cwd()
      var destDir = path.isAbsolute(cliOptions.output) ? cliOptions.output : path.join(cwd, cliOptions.output)

      var quantumJson = require(path.relative(__dirname, path.join(cwd, 'quantum.json')))
      var pages = quantumJson.pages || '**/*.um'
      var base = quantumJson.base || '.'
      var buildConcurrency = cliOptions.buildConcurrency || quantumJson.buildConcurrency || 1
      var customPipelineConfig = quantumJson

      client.build({
        dir: cwd,
        pipeline: options.pipeline,
        resourceDir: options.resourceDir,
        pages: pages,
        base: base,
        dest: destDir,
        isLocal: true,
        customPipelineConfig: customPipelineConfig,
        buildConcurrency: buildConcurrency,
        quiet: cliOptions.quiet,
        progress: cliOptions.progress
      }).catch(exitInError)
    })

  program
    .command('watch')
    .description('watches the docs project and starts a server locally')
    .option('-o, --output [output]', 'The directory to output to', 'target')
    .option('-q, --quiet', 'Only log errors', false)
    .option('-s, --progress', 'Use progressbars instead of detailed logging', false)
    .option('-c, --build-concurrency', 'How many pages to build in parallel')
    .option('-p, --port [port]', 'The port to run the web server on')
    .action(function (cliOptions) {
      if (!checkConfigExists()) return process.exit(2)

      var cwd = process.cwd()
      var destDir = path.isAbsolute(cliOptions.output) ? cliOptions.output : path.join(cwd, cliOptions.output)

      var quantumJson = require(path.relative(__dirname, path.join(cwd, 'quantum.json')))
      var pages = quantumJson.pages || '**/*.um'
      var base = quantumJson.base || '.'
      var buildConcurrency = cliOptions.buildConcurrency || quantumJson.buildConcurrency || 1
      var customPipelineConfig = quantumJson
      var port = cliOptions.port || quantumJson.buildConcurrency || 4000

      client.watch({
        dir: cwd,
        pipeline: options.pipeline,
        resourceDir: options.resourceDir,
        pages: pages,
        base: base,
        dest: destDir,
        isLocal: true,
        customPipelineConfig: customPipelineConfig,
        buildConcurrency: buildConcurrency,
        quiet: cliOptions.quiet,
        progress: cliOptions.progress,
        port: port
      }).catch(exitInError)
    })

  program
    .command('init')
    .description('initialises a new project in the current directory')
    .action(function () {
      client.init({
        dir: process.cwd()
      }).then(function () {
        console.log('Project initialised. Template quantum.json file created.')
      }).catch(exitInError)
    })

  program
    .command('publish')
    .option('-k, --key [key]', 'The publish key to use')
    .option('-h, --host [host]', 'The hub to publish to')
    .description('publishes the project')
    .action(function (cliOptions) {
      if (!checkConfigExists()) return process.exit(2)
      var cwd = process.cwd()
      var quantumJson = require(path.relative(__dirname, path.join(cwd, 'quantum.json')))

      client.publish({
        dir: cwd,
        ca: options.ca,
        host: cliOptions.host,
        key: cliOptions.key,
        projectId: quantumJson.projectId,
        files: quantumJson.files,
        pages: quantumJson.pages
      }).catch(exitInError)
    })

  program
    .command('entities')
    .description('lists out the entities that can be used in pages')
    .action(function () {
      var htmlTransforms = options.htmlTransforms

      if (htmlTransforms) {
        Object.keys(htmlTransforms).forEach(function (namespace) {
          console.log(chalk.yellow(namespace))
          Object.keys(htmlTransforms[namespace]).forEach(function (entity) {
            console.log(chalk.cyan('  @' + entity) + chalk.gray(' (@' + namespace + '.' + entity + ')'))
          })
        })
      } else {
        console.log(chalk.yellow('htmlEntites has not been exported in the quantum.config.js'))
      }
    })

  program
    .command('help', {isDefault: true})
    .description('shows the help information for this tool')
    .action(function () {
      program.help()
    })

  program.parse(process.argv)
}
