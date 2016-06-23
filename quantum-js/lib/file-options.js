/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  File Option
  ===========

  Glob-spec resolving to list of files

*/

var path = require('path')
var Promise = require('bluebird')
var globby = require('globby')
var flatten = require('flatten')

var File = require('./file')

function isString (str) {
  return typeof str === 'string' || str instanceof String
}

/* Converts a filename (and spec) to an object with relevant details copied over from the spec */
function createFileUsingSpec (src, spec, dest) {
  var base = spec.base
  var destForObj = spec.dest ? path.join(dest, spec.dest) : dest
  var resolved = path.relative(base, src)
  var dest = path.join(destForObj, resolved)
  var watch = spec.watch === undefined ? true : spec.watch
  return new File({
    src: src,
    resolved: resolved,
    base: base,
    dest: dest,
    watch: watch
  })
}

/* Checks a spec or array of specs looks correct (has all the correct properties etc) */
function validate (specs) {
  return validateSpec(specs) || (Array.isArray(specs) && specs.every(validateSpec))
}

/* Checks the spec passed in look like a valid spec */
function validateSpec (spec) {
  return spec !== undefined && (
  isString(spec) ||
  isString(spec.files) ||
  (Array.isArray(spec.files) && spec.files.every(isString)))
}

/* Expands short spec definitions into full definitions */
function normalize (specs) {
  var arrayedSpecs = Array.isArray(specs) ? specs : [specs]
  var objectifiedSpecs = arrayedSpecs.map(normalizeSpec)
  return objectifiedSpecs
}

/* Makes sure a single object in the list argument is of the right shape */
function normalizeSpec (item) {
  if (isString(item)) {
    return {
      files: [item],
      base: inferBase(item),
      watch: true
    }
  } else {
    var files = Array.isArray(item.files) ? item.files : [item.files]
    return {
      files: files,
      base: (files.length === 1 && !item.base) ? inferBase(files[0]) : item.base,
      watch: item.watch,
      dest: item.dest
    }
  }
}

/* Infers a sensible base directory for a glob string */
function inferBase (globString) {
  var end = globString.indexOf('*')
  return globString.slice(0, end - 1)
}

/* Resolves a list of specs into a list of file-objects */
function resolve (specs, opts) {
  if (!validate(specs)) return Promise.reject(new Error('invalid specs argument'))
  var options = opts || {}
  var dir = options.dir || '.'
  var dest = options.dest || 'target'
  return Promise.all(normalize(specs))
    .map(function (spec) {
      return Promise.resolve(globby(spec.files, {cwd: dir, nodir: true}))
        .map(function (file) {
          return createFileUsingSpec(file, spec, dest)
        })
    }).then(flatten)
}

module.exports = {
  resolve: resolve,
  validate: validate,
  createFileUsingSpec: createFileUsingSpec,
  normalize: normalize
}
