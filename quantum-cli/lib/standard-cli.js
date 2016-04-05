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
  is used for working on the docs locally only and allows configuing the entire
  quantum pipeline via a config file config.

*/

var program = require('commander')
var chalk = require('chalk')
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
  if (!fileExists('quantum.config.js')) {
    console.log(chalk.red('Error: ') + chalk.yellow('quantum.config.js') + ' not found in the current directory')
    return false
  } else {
    return true
  }
}

function exitInError (err) {
  console.error(chalk.red(err.stack || err))
  process.exit(1)
}

module.exports = function () {
  program
    .version(require('../package.json').version)
    .description('A command line tool for building a website using quantum.js')

  program
    .command('build')
    .description('builds the project')
    .option('-o, --output [output]', 'The directory to output to', 'target')
    .option('-p, --pages [pages]', 'A glob which matches the pages to build')
    .option('-b, --base [base]', 'The directory to treat as the root of the site')
    .option('-c, --build-concurrency [buildConcurrency]', 'How many pages to build in parallel')
    .option('-r, --resources [resourcesDir]', 'The resources directory')
    .option('-q, --quiet', 'Only log errors', false)
    .option('-s, --progress', 'Use progressbars instead of detailed logging', false)
    .action(function (cliOptions) {
      if (!checkConfigExists()) return process.exit(2)

      var projectDir = process.cwd()
      var destDir = path.isAbsolute(cliOptions.output) ? cliOptions.output : path.join(projectDir, cliOptions.output)
      var configFilename = path.relative(__dirname, path.join(projectDir, 'quantum.config.js'))

      var config = require(configFilename)

      if (!config.pipeline) {
        console.log(chalk.red('Error: ') + chalk.yellow('pipeline') + ' not found in config')
        process.exit(2)
        return
      }

      var pipeline = config.pipeline

      var resourceDir = cliOptions.resourcesDir || config.resourceDir
      var pages = cliOptions.pages || config.pages || '**/*.um'
      var base = cliOptions.base || config.base || '.'
      var buildConcurrency = cliOptions.buildConcurrency || config.buildConcurrency || 1

      client.build({
        dir: projectDir,
        pipeline: pipeline,
        resourceDir: resourceDir,
        pages: pages,
        base: base,
        dest: destDir,
        isLocal: true,
        customPipelineConfig: undefined,
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
    .option('-p, --pages [pages]', 'A glob which matches the pages to build')
    .option('-b, --base [base]', 'The directory to treat as the root of the site')
    .option('-c, --build-concurrency [buildConcurrency]', 'How many pages to build in parallel')
    .option('-r, --resources [resourcesDir]', 'The resources directory')
    .option('-p, --port [port]', 'The port to run the web server on')
    .action(function (cliOptions) {
      if (!checkConfigExists()) return process.exit(2)

      var projectDir = process.cwd()
      var destDir = path.isAbsolute(cliOptions.output) ? cliOptions.output : path.join(projectDir, cliOptions.output)
      var configFilename = path.relative(__dirname, path.join(projectDir, 'quantum.config.js'))

      var config = require(configFilename)

      if (!config.pipeline) {
        console.log(chalk.red('Error: ') + chalk.yellow('pipeline') + ' not found in config')
        return
      }

      var pipeline = config.pipeline

      var resourceDir = cliOptions.resources || config.resourceDir
      var pages = cliOptions.pages || config.pages || '**/*.um'
      var base = cliOptions.base || config.base || '.'
      var buildConcurrency = cliOptions.buildConcurrency || config.buildConcurrency || 1
      var port = cliOptions.port || config.port || 4000

      client.watch({
        dir: projectDir,
        pipeline: pipeline,
        resourceDir: resourceDir,
        pages: pages,
        base: base,
        dest: destDir,
        isLocal: true,
        customPipelineConfig: {},
        buildConcurrency: buildConcurrency,
        quiet: cliOptions.quiet,
        progress: cliOptions.progress,
        port: port
      }).catch(exitInError)
    })

  program
    .command('entities')
    .description('lists out the entities that can be used in pages')
    .action(function () {
      if (!checkConfigExists()) return process.exit(2)

      var projectDir = process.cwd()
      var config = require(path.relative(__dirname, path.join(projectDir, 'quantum.config.js')))
      var htmlTransforms = config.htmlTransforms

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
