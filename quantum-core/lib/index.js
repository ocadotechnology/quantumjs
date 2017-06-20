'use strict'
/*

  Main
  ====

  This is the library entry point. This simply collects together the various apis
  defined in other files.

*/

const File = require('./File')
const FileInfo = require('./FileInfo')
const { parse, tokenize, ast, ParseError } = require('./parse')
const { read, readAsFile } = require('./read')
const { select, isText, isEntity, isSelection, Selection } = require('./select')
const clone = require('./clone')
const stringify = require('./stringify')
const write = require('./write')
const json = require('./json')
const { watch, watcher, Watcher } = require('./watch')
const api = require('./api')

module.exports = {
  File,
  FileInfo,
  ParseError,
  Watcher,
  Selection,
  parse,
  tokenize,
  ast,
  read,
  readAsFile,
  clone,
  select,
  isText,
  isEntity,
  isSelection,
  stringify,
  write,
  json,
  watch,
  watcher,
  api
}
