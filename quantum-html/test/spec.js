var chai = require('chai')
var dom = require('quantum-dom')
var html = require('..')
var should = chai.should()
var quantum = require('quantum-js')
var Page = quantum.Page
var File = quantum.File

describe('element', function () {
  it('basic div should get generated properly', function () {
    var page = new Page({
      file: new File({
        src: 'filename.um',
        dest: 'filename.um'
      }),
      content: {
        content: [{
          type: 'div',
          params: [],
          content: []
        }]
      }
    })

    return html()(page)
      .then(function (page) {
        page.file.dest.should.equal('filename.um')
        page.content.body.content[0].type.should.equal('div')
        page.content.body.content.length.should.equal(1)
      })
  })

  describe('shorthand:', function () {
    it('single class', function () {
      var page = new Page({
        file: new File({
          src: 'filename.um',
          dest: 'filename.um'
        }),
        content: {
          content: [{
            type: 'div',
            params: ['.strawberry'],
            content: []
          }]
        }
      })

      return html()(page)
        .then(function (page) {
          page.file.dest.should.equal('filename.um')
          page.content.body.content[0].type.should.equal('div')
          page.content.body.content[0].attrs['class'].should.equal('strawberry')
          page.content.body.content.length.should.equal(1)
        })

    })

    it('multiple of the same class should be coalesced', function () {
      var page = new Page({
        file: new File({
          src: 'filename.um',
          dest: 'filename.um'
        }),
        content: {
          content: [{
            type: 'div',
            params: ['.strawberry.strawberry'],
            content: []
          }]
        }
      })

      return html()(page)
        .then(function (page) {
          page.file.dest.should.equal('filename.um')
          page.content.body.content[0].type.should.equal('div')
          page.content.body.content[0].attrs['class'].should.equal('strawberry')
          page.content.body.content.length.should.equal(1)
        })

    })

    it('multiple classes', function () {
      var page = new Page({
        file: new File({
          src: 'filename.um',
          dest: 'filename.um'
        }),
        content: {
          content: [{
            type: 'div',
            params: ['.strawberry.banana'],
            content: []
          }]
        }
      })

      return html()(page)
        .then(function (page) {
          page.file.dest.should.equal('filename.um')
          page.content.body.content[0].type.should.equal('div')
          page.content.body.content[0].attrs['class'].should.equal('strawberry banana')
          page.content.body.content.length.should.equal(1)
        })

    })

    it('id', function () {
      var page = new Page({
        file: new File({
          src: 'filename.um',
          dest: 'filename.um'
        }),
        content: {
          content: [{
            type: 'div',
            params: ['#strawberry'],
            content: []
          }]
        }
      })

      return html()(page)
        .then(function (page) {
          page.file.dest.should.equal('filename.um')
          page.content.body.content[0].type.should.equal('div')
          page.content.body.content[0].attrs['id'].should.equal('strawberry')
          page.content.body.content.length.should.equal(1)
        })
    })

    it('mixed classes and id', function () {
      var page = new Page({
        file: new File({
          src: 'filename.um',
          dest: 'filename.um'
        }),
        content: {
          content: [{
            type: 'div',
            params: ['#strawberry.banana'],
            content: []
          }]
        }
      })

      return html()(page)
        .then(function (page) {
          page.file.dest.should.equal('filename.um')
          page.content.body.content[0].type.should.equal('div')
          page.content.body.content[0].attrs['id'].should.equal('strawberry')
          page.content.body.content[0].attrs['class'].should.equal('banana')
          page.content.body.content.length.should.equal(1)
        })

    })
  })

})
