const chai = require('chai')
const version = require('..')
const quantum = require('quantum-js')
const path = require('path')

chai.should()

const Page = quantum.Page
const File = quantum.File

// reads and executes in a suite defined in quantm markup
function testSuite (filename) {
  quantum.read(path.join(__dirname, filename)).then((parsed) => {
    const suite = quantum.select(parsed)
    describe('test suite: ' + filename, () => {
      suite.selectAll('spec').forEach((spec) => {
        it(spec.ps(), () => {
          const source = spec.select('source')
          const filename = source.select('filename').ps()
          const content = {content: source.select('content').content()}
          const input = new Page({
            file: new File({
              src: filename,
              dest: filename
            }),
            content: content
          })

          const expected = spec.select('expected')
          const outputs = expected.selectAll('output').map((output) => {
            // console.log(output.select('content').content())
            const outputFilename = output.select('filename').ps()
            const outputContent = {content: output.select('content').content()}
            const outputVersion = output.select('version').ps()
            return (new Page({
              file: new File({
                src: filename,
                dest: outputFilename
              }),
              content: outputContent
            })).clone({
              meta: {
                version: outputVersion
              }
            })
          })

          const options = {
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

describe('extra tests', () => {
  it('should return a function', () => {
    version({}).should.be.a.function
  })

  it('should do nothing without version entities', () => {
    const src = {
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
