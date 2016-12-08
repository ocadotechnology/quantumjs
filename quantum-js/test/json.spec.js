'use strict'

const chai = require('chai')
const quantum = require('../')

chai.should()

const File = quantum.File
const FileInfo = quantum.FileInfo

describe('json', () => {
  it('should convert a page to json', () => {
    const file = new File({
      info: new FileInfo({
        src: 'src/page.um',
        resolved: 'page.um',
        base: 'src',
        dest: 'target/a.um',
        watch: true
      }),
      content: {
        type: 'tag',
        params: ['one'],
        content: []
      }
    })

    quantum.json()(file).should.eql(new File({
      info: new FileInfo({
        src: 'src/page.um',
        resolved: 'page.um',
        base: 'src',
        dest: 'target/a.json',
        watch: true
      }),
      content: JSON.stringify({
        type: 'tag',
        params: ['one'],
        content: []
      }, null, 2)
    }))
  })
})
