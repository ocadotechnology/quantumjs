var path = require('path')
var chalk = require('chalk')
var ProgressBar = require('progress')

// renames name.html to name/index.html and leaves index.html as it is
//XXX: remove when releasing 1.0.0
exports.htmlRenamer = function (obj) {
  console.warn('hub.utils.htmlRenamer is deprecated; use html.htmlRenamer() instead')
  var filenameWithoutExtension = path.basename(obj.filename).replace('.html', '')
  var root = path.dirname(obj.filename)
  return {
    filename: filenameWithoutExtension === 'index' ? obj.filename : path.join(root, filenameWithoutExtension, 'index.html'),
    content: obj.content
  }
}

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
  eventEmitter
    .on('pagesstart', function (evt) { console.log('Rebuilding ' + chalk.yellow(evt.filenames.length) + ' pages.') })
    .on('pagestart', function (evt) {
      console.log('Starting ' + chalk.green(evt.filename))
      startTimes[evt.filename] = Date.now()
    })
    .on('pagefinish', function (evt) {
      console.log('Finished ' + chalk.green(evt.filename) + '. Took ' + chalk.cyan((Date.now() - startTimes[evt.filename])) + ' ms.')
    })
    .on('pagesfinish', function (evt) {
      console.log('Finished builing ' + chalk.yellow(evt.filenames.length) + ' pages.')
    })
    .on('finish', function (evt) {})
}
