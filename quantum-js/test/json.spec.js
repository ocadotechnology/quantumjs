var should = require('chai').should()

var quantum = require('..')
var Page = quantum.Page
var File = quantum.File

describe('json', function () {
  it('should convert a page to json', function () {
    var page = new Page({
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
