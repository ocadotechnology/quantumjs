'use strict'

const path = require('path')

const chai = require('chai')
const quantum = require('quantum-js')

const api = require('../../..')
const changelogFileTransform = require('../../../lib/file-transforms/changelog')

chai.should()

const testlanguage = {
  name: 'test-language-1',
  changelog: {
    entityTypes: ['function'],
    assets: []
  }
}

chai.should()

function checkSpec (spec) {
  const fileInfo = new quantum.FileInfo({
    src: 'src/content/a1.um',
    resolved: 'a1.um',
    base: 'src/content',
    dest: 'target/a1.um',
    watch: true
  })

  const inputFile = new quantum.File({
    info: fileInfo,
    content: {
      type: '',
      params: [],
      content: spec.select('input').content()
    }
  })

  const outputFile = new quantum.File({
    info: fileInfo,
    content: {
      type: '',
      params: [],
      content: spec.select('output').content()
    }
  })

  const options = {
    languages: [testlanguage],
    changelogGroupByApi: spec.select('options').select('groupByApi').ps() === 'true',
    changelogReverseVisibleList: spec.select('options').select('reverseVisibleList').ps() === 'true'
  }

  api.fileTransform(options)(inputFile).should.eql(outputFile)
}

describe('fileTransform', () => {
  it('spec.um', () => {
    return quantum.read(path.join(__dirname, 'spec.um'))
      .then(parsed => {
        quantum.select(parsed)
          .selectAll('spec')
          .forEach(checkSpec)
      })
  })

  describe('fileTransform', () => {
    it('should do nothing when there is no @changelogList', () => {
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
          content: []
        }
      })
      changelogFileTransform.fileTransform(file).should.eql(file)
    })

    it('should process page when a @changelogList is found', () => {
      const page = new quantum.File({
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

      const options = {
        languages: [testlanguage],
        changelogGroupByApi: true,
        changelogReverseVisibleList: true
      }

      changelogFileTransform.fileTransform(page, options).should.not.equal(page)
      changelogFileTransform.fileTransform(page, options).should.be.an.instanceof(quantum.File)
    })
  })
})
