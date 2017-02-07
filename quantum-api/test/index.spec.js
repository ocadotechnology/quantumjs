'use strict'

const chai = require('chai')
const quantum = require('quantum-js')
const api = require('..')

chai.should()

function checkProps (transforms, props) {
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
    api.should.be.an('object')
    api.fileTransform.should.be.a('function')
    api.transforms.should.be.a('function')
  })

  it('should return an object with the javascript and css languages by default', () => {
    const transforms = api.transforms()
    checkProps(transforms, [...topLevelProps, 'javascript', 'css'])
    checkProps(transforms.javascript, jsProps)
    checkProps(transforms.css, cssProps)
  })

  it('should be possible to specify the languages (javascript only)', () => {
    const javascript = api.languages.javascript()
    const transforms = api.transforms({languages: [ javascript ]})
    checkProps(transforms, [...topLevelProps, 'javascript'])
    checkProps(transforms.javascript, jsProps)
  })

  it('should be possible to specify the languages (css only)', () => {
    const css = api.languages.css()
    const transforms = api.transforms({languages: [ css ]})
    checkProps(transforms, [...topLevelProps, 'css'])
    checkProps(transforms.css, cssProps)
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
