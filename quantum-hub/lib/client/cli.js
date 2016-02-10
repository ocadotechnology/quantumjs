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
var isOutdated = require('is-outdated')
var client = require('./index')
var chalk = require('chalk')
var merge = require('merge')

function start (opts) {
  var options = merge({
    resourceDir: undefined,
    pipeline: undefined,
    includeServerCommands: true,
    version: undefined,
    ca: undefined,
    htmlTransforms: undefined
  }, opts)

  // notify the user if they are behind the times. packageName should be supplied for this feature to work.
  if (options.packageName) {
    isOutdated(options.packageName, options.version, function (err, res) {
      if (!err) {
        console.log('The latest version of this app is %s', res.version)
        console.log('Please update it with: npm update -g ' + packageName)
      }
    })
  }

  program
    .version(options.version)
    .description('A command line utility for building a website using quantum.js')

  program
    .command('init [dir]')
    .description('initialises a new project in the current directory, or the directory specified')
    .action(function (dir) {
      client.init({
        dir: dir || process.cwd()
      }).then(function () {
        console.log('Project initialised. quantum.json file created.')
      }).catch(function (err) {
        console.error(chalk.red(err))
      })
    })

  program
    .command('watch [dir]')
    .description('watches the docs project and starts a server locally')
    .option('-o, --output [output]', 'The directory to output to', 'target')
    .option('-p, --port [port]', 'The port to run the web server on', 4000)
    .option('-q, --quiet', 'Only log errors', false)
    .option('-s, --progress', 'Use progressbars instead of detailed logging', false)
    .action(function (dir, cliOptions) {
      client.watch({
        dir: dir || process.cwd(),
        dest: cliOptions.output,
        port: cliOptions.port,
        quiet: cliOptions.quiet,
        progress: cliOptions.progress,
        config: require((dir || process.cwd()) + '/quantum.json'),
        pipeline: options.pipeline,
        resourceDir: options.resourceDir
      })
    })

  program
    .command('build [dir]')
    .description('builds the project')
    .option('-o, --output [output]', 'The directory to output to', 'target')
    .option('-q, --quiet', 'Only log errors', false)
    .option('-s, --progress', 'Use progressbars instead of detailed logging', false)
    .action(function (dir, cliOptions) {
      client.build({
        dir: dir || process.cwd(),
        dest: cliOptions.outputs,
        quiet: cliOptions.quiet,
        progress: cliOptions.progress,
        config: require((dir || process.cwd()) + '/quantum.json'),
        pipeline: options.pipeline,
        resourceDir: options.resourceDir
      }).catch(function (err) {
        console.error(chalk.red(err))
      })
    })

  if (options.includeServerCommands) {
    function setRevision (dir, hubname, revision) {
      return client.setRevision({
        dir: dir || process.cwd(),
        hubname: hubname,
        revision: revision,
        ca: options.ca
      }).then(function () {
        console.log('Live version changed to ' + chalk.yellow(revision))
      })
    }

    program
      .command('publish <hubname> [dir]')
      .description('publishes the project')
      .option('-u, --update', 'Promote the project to live straight away', false)
      .action(function (hubname, dir, cliOptions) {
        client.publish({
          dir: dir || process.cwd(),
          hubname: hubname,
          ca: options.ca
        }).then(function (revision) {
          console.log('Revision ' + chalk.yellow(revision) + ' published')
          if (cliOptions.update) {
            return setRevision(dir || process.cwd(), hubname, revision)
          }
        }).catch(function (err) {
          console.error(chalk.red(err))
        })
      })

    program
      .command('set-revision <hubname> <revision> [dir]')
      .description('sets the live version of the site to a specific revision')
      .action(function (hubname, revision, dir) {
        setRevision(dir || process.cwd(), hubname, revision)
          .catch(function (err) {
            console.error(chalk.red(err))
          })
      })
  }

  program
    .command('entities')
    .description('lists out the entities that can be used in pages')
    .action(function () {
      Object.keys(options.htmlTransforms).forEach(function (namespace) {
        console.log(chalk.yellow(namespace))
        Object.keys(options.htmlTransforms[namespace]).forEach(function (entity) {
          console.log(chalk.cyan('  @' + entity) + chalk.gray(' (@' + namespace + '.' + entity  + ')'))
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

module.exports = {
  start: start
}
