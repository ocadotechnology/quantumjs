'use strict'

const chai = require('chai')
const quantum = require('quantum-js')
const api = require('..')

chai.should()

function checkTransforms (options, props) {
  const transforms = api.transforms(options)
  transforms.should.be.an('object')

  // Sorted because object order doesn't matter
  const transformFunctionNames = Object.keys(transforms).sort()
  transformFunctionNames.should.eql(props.sort())

  transformFunctionNames.forEach(name => {
    // Make sure each transform is a function
    transforms[name].should.be.a('function');
    // check that the signature of each transform is (selection, transformer)
    (`${name} ${transforms[name].length}`).should.equal(`${name} 2`)
  })
}

const topLevelProps = [
  'api',
  'changelogList',
  'changelog'
]
const cssProps = [
  'class',
  'childclass',
  'extraclass'
]
const jsProps = [
  'type',
  'prototype',
  'object',
  'method',
  'function',
  'constructor',
  'param',
  'param?',
  'property',
  'property?',
  'event',
  'returns'
]

describe('quantum-api', () => {
  it('should export the correct things', () => {
    api.should.be.a('object')
    api.fileTransform.should.be.a('function')
    api.transforms.should.be.a('function')
  })

  it('should return an object with the javascript and css languages by default', () => {
    checkTransforms({}, [...topLevelProps, ...jsProps, ...cssProps])
  })

  it('should be possible to specify the languages (javascript only)', () => {
    const javascript = api.languages.javascript()
    checkTransforms({languages: [ javascript ]}, [...topLevelProps, ...jsProps])
  })

  it('should be possible to specify the languages (css only)', () => {
    const css = api.languages.css()
    checkTransforms({languages: [ css ]}, [...topLevelProps, ...cssProps])
  })

  it('should do nothing when options.processChangelogs is false', () => {
    const file = new quantum.File({
      info: new quantum.FileInfo({
        src: 'src/content/a1.um',
        resolved: 'a1.um',
        base: 'src/content',
        dest: 'target/a1.um',
        watch: true
      }),
      content: {
        type: '',
        params: [],
        content: [
          {
            type: 'changelogList',
            params: [],
            content: []
          }
        ]
      }
    })
    api.fileTransform({processChangelogs: false})(file).should.eql(file)
  })
})
