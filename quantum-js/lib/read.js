/*

     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  Read
  ====

  Reads a file and parses it, returning the result as a promise. Reading a
  file this way also has the option of following @inline links to other files.

*/

var Promise = require('bluebird')
var merge = require('merge')
var path = require('path')
var fs = Promise.promisifyAll(require('fs'))
var glob = Promise.promisify(require('glob'))
var parse = require('./parse')
var Page = require('./page')
var File = require('./file')

function defaultLoader (filename, parentFilename) {
  return fs.readFileAsync(filename, 'utf-8')
}

function flatten (arrays) {
  return Array.prototype.concat.apply([], arrays)
}

function inline (parsed, currentDir, options, parentFile) {
  var promises = []

  parsed.content.forEach((entity, i) => {
    if (entity.type === options.inlineEntityType) {
      var doParse

      if (!doParse && entity.params.length > 1 && entity.params[1] === 'parse') {
        doParse = true
      }

      if (!doParse && entity.params.length > 1 && entity.params[1] === 'text') {
        doParse = false
      }

      var filename = path.join(currentDir, entity.params[0])
      var promise = parseFiles(filename, doParse, options, parentFile)
        .then((res) => {
          var newContent = flatten(res.map((d) => d.content))
          return parsed.content.splice.apply(parsed.content, [i, 1].concat(newContent))
        })
      promises.push(promise)
    } else if (entity.type !== undefined) {
      promises.push(inline(entity, currentDir, options, parentFile))
    }
  })

  return Promise.all(promises).then(() => parsed)
}

function parseFile (filename, doParse, options, parentFile) {
  if (doParse || doParse === undefined && path.extname(filename) === '.um') {
    var currentDir = path.dirname(filename)
    return options.loader(filename, parentFile)
      .then((input) => parse(input, options))
      .then((parsed) => inline(parsed, currentDir, options, filename))
      .catch((e) => {
        throw new Error('quantum: ' + filename + ': ' + e)
      })
  } else {
    return options.loader(filename, parentFile).then((input) => ({
      content: input.split('\n')
    }))
  }
}

function parseFiles (globString, doParse, options, parentFile) {
  return glob(globString).map((filename) => parseFile(filename, doParse, options, parentFile))
}

function read (filename, options) {
  options = merge({
    inlineEntityType: 'inline',
    inline: true,
    loader: defaultLoader,
    base: undefined
  }, options)

  // TODO: Unused var?
  var relativeFilename = options.base ? path.relative(options.base, filename) : filename

  if (options.inline) {
    return parseFile(filename, true, options)
  } else {
    return options.loader(filename, undefined).then(parse)
  }
}

module.exports = read

module.exports.page = (filename, options) => {
  return read(filename, options).then((content) => {
    return new Page({
      file: new File({
        src: filename,
        dest: filename
      }),
      content: content
    })
  })
}
