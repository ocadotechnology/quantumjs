'use strict'
/*

  Read
  ====

  Reads a file and parses it, returning the result as a promise. Reading a
  file this way also has the option of following @inline links to other files.

*/

const Promise = require('bluebird')
const path = require('path')
const fs = Promise.promisifyAll(require('fs'))
const globby = require('globby')
const parse = require('./parse')
const File = require('./file')
const FileInfo = require('./file-info')

function defaultFileReader (filename, parentFilename) {
  return fs.readFileAsync(filename, 'utf-8')
}

function flatten (arrays) {
  return Array.prototype.concat.apply([], arrays)
}

const inline = Promise.coroutine(function * (parsed, currentDir, options, parentFile) {
  const content = parsed.content
  let i = 0
  while (i < content.length) {
    const entity = content[i]
    if (entity.type === options.inlineEntityType) {
      const doParse = entity.params[1] === 'parse' ? true : entity.params[1] === 'text' ? false : undefined

      const globStrings = entity.params.filter(p => p).map(p => path.join(currentDir, p))
      const parsedFiles = yield parseFiles(globStrings, doParse, options, parentFile)
      const newContent = flatten(parsedFiles.map(f => f.content))

      content.splice.apply(content, [i, 1].concat(newContent))
      i += newContent.length - 1
    } else if (entity.type !== undefined) {
      yield inline(entity, currentDir, options, parentFile)
    }

    i += 1
  }

  return parsed
})

function parseFile (filename, doParse, options, parentFile) {
  if (doParse || doParse === undefined && path.extname(filename) === '.um') {
    const currentDir = path.dirname(filename)
    return options.fileReader(filename, parentFile)
      .then(input => parse(input, options))
      .then(parsed => inline(parsed, currentDir, options, filename))
      .catch(e => {
        if (e instanceof parse.ParseError) {
          e.filename = e.filename || filename
          throw e
        } else {
          throw new Error(`quantum: ${filename}: ${e}`)
        }
      })
  } else {
    return options.fileReader(filename, parentFile).then((input) => ({
      content: input.split('\n')
    }))
  }
}

function parseFiles (globStrings, doParse, options, parentFile) {
  return Promise.resolve(globby(globStrings))
    .map(filename => parseFile(filename, doParse, options, parentFile))
}

function read (filename, opts) {
  const {
    inlineEntityType = 'inline',
    inline = true,
    fileReader = defaultFileReader,
    base = undefined
  } = opts || {}

  const options = { inlineEntityType, inline, fileReader, base }

  if (options.inline) {
    return parseFile(filename, true, options)
  } else {
    return options.fileReader(filename, undefined).then(parse)
  }
}

function readAsFile (filename, options) {
  return read(filename, options).then(content => {
    return new File({
      info: new FileInfo({
        src: filename,
        dest: filename
      }),
      content: content
    })
  })
}

module.exports = {
  read,
  readAsFile,
  defaultFileReader
}
