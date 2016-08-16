var chai = require('chai')
var version = require('..')
var should = chai.should()
var quantum = require('quantum-js')
var path = require('path')
var Page = quantum.Page
var File = quantum.File

// reads and executes in a suite defined in quantm markup
function testSuite (filename) {
  quantum.read(path.join(__dirname, filename)).then(function (parsed) {
    var suite = quantum.select(parsed)
    describe('test suite: ' + filename, function () {
      suite.selectAll('spec').forEach(function (spec) {
        it(spec.ps(), function () {
          var source = spec.select('source')
          var filename = source.select('filename').ps()
          var content = {content: source.select('content').content()}
          var input = new Page({
            file: new File({
              src: filename,
              dest: filename
            }),
            content: content
          })

          var expected = spec.select('expected')
          var outputs = expected.selectAll('output').map(function (output) {
            // console.log(output.select('content').content())
            var outputFilename = output.select('filename').ps()
            var outputContent = {content: output.select('content').content()}
            var outputVersion = output.select('version').ps()
            return (new Page({
              file: new File({
                src: filename,
                dest: outputFilename
              }),
              content: outputContent,
            })).clone({
              meta: {
                version: outputVersion
              }
            })

          })

          var options = {
            unmergeable: ['unmergeable'],
            taggable: ['function', 'method', 'constructor', 'property', 'object', 'class', 'prototype'],
            versions: spec.select('versions').content(),
            outputLatest: false
          }

          version(options)(input).should.eql(outputs)
        })
      })
    })
  })
}

testSuite('suite.um')

describe('extra tests', function () {
  it('should return a function', function () {
    version({}).should.be.a.function
  })

  it('should do nothing without version entities', function () {
    var src = {
      filename: 'filename.um',
      content: {
        content: [{
          type: 'fruits',
          params: ['banana', 'strawberry'],
          content: []
        },
          {
            type: 'veg',
            params: ['carrot', 'sweetcorn'],
            content: []
          }]
      }
    }

    version({outputLatest: false})(src).should.eql([src])
  })

})
