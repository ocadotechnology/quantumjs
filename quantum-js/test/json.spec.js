'use strict'
require('chai').should()

const quantum = require('..')
const Page = quantum.Page
const File = quantum.File

describe('json', () => {
  it('should convert a page to json', () => {
    const page = new Page({
      file: new File({
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

    quantum.json()(page).should.eql(new Page({
      file: new File({
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
