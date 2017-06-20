'use strict'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
chai.should()

const quantum = require('..')

describe('quantum-core', () => {
  it('exports the correct things', () => {
    quantum.should.be.an('object')
    quantum.should.have.keys([
      'File',
      'FileInfo',
      'Selection',
      'ParseError',
      'parse',
      'tokenize',
      'ast',
      'stringify',
      'read',
      'readAsFile',
      'write',
      'select',
      'isText',
      'isEntity',
      'isSelection',
      'json',
      'watch',
      'watcher',
      'Watcher',
      'api',
      'clone'
    ])

    quantum.File.should.be.a('function')
    quantum.FileInfo.should.be.a('function')
    quantum.Selection.should.be.a('function')
    quantum.ParseError.should.be.a('function')
    quantum.parse.should.be.a('function')
    quantum.tokenize.should.be.a('function')
    quantum.ast.should.be.a('function')
    quantum.stringify.should.be.a('function')
    quantum.read.should.be.a('function')
    quantum.readAsFile.should.be.a('function')
    quantum.write.should.be.a('function')
    quantum.select.should.be.a('function')
    quantum.isText.should.be.a('function')
    quantum.isEntity.should.be.a('function')
    quantum.isSelection.should.be.a('function')
    quantum.json.should.be.a('function')
    quantum.watch.should.be.a('function')
    quantum.watcher.should.be.a('function')
    quantum.Watcher.should.be.a('function')
    quantum.api.should.be.an('object')
    quantum.clone.should.be.a('function')
  })

  require('./clone.spec')
  require('./File.spec')
  require('./FileInfo.spec')
  require('./file-options.spec')
  require('./json.spec')
  require('./parse.spec')
  require('./read.spec')
  require('./select.spec')
  require('./stringify.spec')
  require('./watch.spec')
  require('./write.spec')
})
