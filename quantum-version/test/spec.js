var chai = require('chai')
var version = require('..')
var should = chai.should()
var quantum = require('quantum-js')
var path = require('path')

// reads and exectures in a suite defined in um (as it is easier to write test cases in um)
function testSuite (filename) {
  quantum.read(path.join('test/', filename)).then(function (obj) {
    var suite = quantum.select(obj[0].content)
    describe('test suite: ' + filename, function () {
      suite.selectAll('spec').forEach(function (specEntity) {
        var spec = quantum.select(specEntity)

        it(spec.ps(), function () {
          var source = spec.select('source')
          var filename = source.select('filename').ps()
          var content = {content: source.select('content').content}
          var input = {filename: filename, content: content}

          var expected = spec.select('expected')
          var output = expected.selectAll('output').map(function (outputEntity) {
            var outputSelection = quantum.select(outputEntity)
            var outputFilename = outputSelection.select('filename').ps()
            var outputContent = {content: outputSelection.select('content').content}
            var outputVersion = outputSelection.select('version').ps()
            return {filename: outputFilename, content: outputContent, version: outputVersion }
          })

          var options = {
            unmergeable: ['unmergeable'],
            taggable: ['function', 'method', 'constructor', 'property', 'object', 'class', 'prototype'],
            versions: spec.select('versions').content,
            outputLatest: false
          }

          version(options)(input).should.eql(output)
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
