'use strict'
require('chai').should()

const version = require('..')
const quantum = require('quantum-js')
const path = require('path')
const Page = quantum.Page
const File = quantum.File

describe('pipeline', () => {
  it('should export the correct things', () => {
    version.should.be.a.function
  })

  it('should return a function', () => {
    version().should.be.a.function
  })

  it('should do nothing without version entities', () => {
    const page = new Page({
      file: new File({
        src: 'filename.um',
        dest: 'filename.um'
      }),
      content: {
        content: [
          {
            type: 'stawberry',
            params: ['0.1.0'],
            content: []
          },
          {
            type: 'raspberry',
            params: ['0.2.0'],
            content: []
          }]
      }
    })

    version({outputLatest: false})(page).should.eql([page])
  })

  it('should warn when no version list could be found', () => {
    const page = new Page({
      file: new File({
        src: 'filename.um',
        dest: 'filename.um'
      }),
      content: {
        content: [
          {
            type: 'version',
            params: ['0.1.0'],
            content: []
          },
          {
            type: 'version',
            params: ['0.2.0'],
            content: []
          }]
      }
    })

    version()(page)[0].warnings.should.eql([
      {
        module: 'quantum-version',
        problem: 'This file contains versioned content, but the full list of versions is not available for quantum-version to use: options.versions is not defined and no @versionsList was found in this file',
        resolution: 'Either define a @versionList or pass in options.versions to quantum-version'
      }
    ])
  })

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
              targetVersions: spec.has('targetVersions') ? spec.select('targetVersions').content() : undefined,
              outputLatest: spec.has('outputLatest')
            }

            version(options)(input).should.eql(outputs)
          })
        })
      })
    })
  }

  testSuite('suite.um')
})
