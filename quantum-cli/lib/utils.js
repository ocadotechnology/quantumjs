var path = require('path')
var chalk = require('chalk')
var ProgressBar = require('progress')

exports.progressBarLogger = function (eventEmitter) {
  var bar = undefined
  eventEmitter
    .on('pagesstart', function (evt) {bar = new ProgressBar('building :current/:total [:bar] :eta', { total: evt.filenames.length, complete: chalk.green('='), width: 50 }) })
    .on('pagestart', function (evt) {})
    .on('pagefinish', function (evt) { bar.tick() })
    .on('pagesfinish', function (evt) {})
    .on('finish', function (evt) {})
}

exports.verboseLogger = function (eventEmitter) {
  var startTimes = {}
  var start = Date.now()
  eventEmitter
    .on('pagesstart', function (evt) { console.log('Rebuilding ' + chalk.yellow(evt.filenames.length) + ' pages.') })
    .on('pagestart', function (evt) {
      startTimes[evt.filename] = Date.now()
    })
    .on('pagefinish', function (evt) {
      console.log('Built ' + chalk.green(evt.filename) + '. Took ' + chalk.cyan((Date.now() - startTimes[evt.filename])) + ' ms.')
    })
    .on('pagesfinish', function (evt) {
      console.log('Finished builing ' + chalk.yellow(evt.filenames.length) + ' pages. Took ' + chalk.cyan((Date.now() - start)) + ' ms in total.')
    })
    .on('finish', function (evt) {})
}
