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

var client = require('./client')

module.exports = function (opts) {
  var options = merge({
    pipeline: undefined, // a function that can build a page. must be supplied for
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
      var projectDir = process.cwd()
      var destDir = path.isAbsolute(cliOptions.output) ? cliOptions.output : path.join(projectDir, cliOptions.output)

      // XXX: if configured via the options (for a hub, use the quantum.json file for loading in config, otherwise use quantum.config.js)

      var config = require(path.relative(__dirname, path.join(projectDir, 'quantum.config.js')))
      var pipeline = options.pipeline || config.pipeline
      var resourceDir = options.resourceDir || config.resourceDir
      var pages = cliOptions.pages || config.pages || '**/*.um' // XXX: or get from quantum.json
      var base = cliOptions.base || config.base || '.' // XXX: or get from quantum.json
      var buildConcurrency = cliOptions.buildConcurrency || config.buildConcurrency || 1
      var customPipelineConfig = config.customPipelineConfig || {} // XXX: pass in quantum.json if being used

      client.build({
        dir: projectDir,
        pipeline: pipeline,
        resourceDir: resourceDir,
        pages: pages,
        base: base,
        dest: destDir,
        isLocal: true,
        customPipelineConfig: customPipelineConfig,
        buildConcurrency: buildConcurrency,
        quiet: cliOptions.quiet,
        progress: cliOptions.progress
      }).catch(function (err) {
        console.error(chalk.red(err.stack))
      })
    })

  program
    .command('watch')
    .description('watches the docs project and starts a server locally')
    .option('-o, --output [output]', 'The directory to output to', 'target')
    .option('-q, --quiet', 'Only log errors', false)
    .option('-s, --progress', 'Use progressbars instead of detailed logging', false)
    .option('-c, --build-concurrency', 'How many pages to build in parallel')
    .option('-p, --port [port]', 'The port to run the web server on', 4000)
    .action(function (cliOptions) {
      var projectDir = process.cwd()
      var destDir = path.isAbsolute(cliOptions.output) ? cliOptions.output : path.join(projectDir, cliOptions.output)

      // XXX: if configured via the options (for a hub, use the quantum.json file for loading in config, otherwise use quantum.config.js)

      var config = require(path.relative(__dirname, path.join(projectDir, 'quantum.config.js')))
      var pipeline = options.pipeline || config.pipeline
      var resourceDir = options.resourceDir || config.resourceDir
      var pages = cliOptions.pages || config.pages || '**/*.um' // XXX: or get from quantum.json
      var base = cliOptions.base || config.base || '.' // XXX: or get from quantum.json
      var buildConcurrency = cliOptions.buildConcurrency || config.buildConcurrency || 1
      var customPipelineConfig = config.customPipelineConfig || {} // XXX: pass in quantum.json if being used

      client.watch({
        dir: projectDir,
        pipeline: pipeline,
        resourceDir: resourceDir,
        pages: pages,
        base: base,
        dest: destDir,
        isLocal: true,
        customPipelineConfig: customPipelineConfig,
        buildConcurrency: buildConcurrency,
        quiet: cliOptions.quiet,
        progress: cliOptions.progress,
        port: cliOptions.port
      })
    })

  program
    .command('init')
    .description('initialises a new project in the current directory')
    .action(function (dir) {
      client.init({
        dir: process.cwd()
      }).then(function () {
        console.log('Project initialised. quantum.json file created.')
      }).catch(function (err) {
        console.error(chalk.red(err.stack))
      })
    })

  program
    .command('publish [hubname]')
    .description('publishes the project')
    .action(function (hubname, cliOptions) {
      client.publish({
        dir: process.cwd(),
        hubname: hubname,
        ca: options.ca
      }).catch(function (err) {
        console.error(chalk.red(err.stack))
      })
    })

  program
    .command('entities')
    .description('lists out the entities that can be used in pages')
    .action(function () {
      var projectDir = process.cwd()
      var config = require(path.relative(__dirname, path.join(projectDir, 'quantum.config.js')))

      var htmlTransforms = options.htmlTransforms || config.htmlTransforms

      Object.keys(htmlTransforms).forEach(function (namespace) {
        console.log(chalk.yellow(namespace))
        Object.keys(htmlTransforms[namespace]).forEach(function (entity) {
          console.log(chalk.cyan('  @' + entity) + chalk.gray(' (@' + namespace + '.' + entity + ')'))
        })
      })
    })

  program
    .command('help', {isDefault: true})
    .description('shows the help information for this tool')
    .action(function () {
      program.help()
    })

  program.parse(process.argv)
}
