'use strict'

const path = require('path')

const chai = require('chai')
const quantum = require('quantum-js')
const dom = require('quantum-dom')

const pageTransform = require('../../lib/page-transform')
const css = require('../../lib/languages/css')

const should = chai.should()

function checkSpec (spec) {
  const file = new quantum.File({
    src: 'src/content/a1.um',
    resolved: 'a1.um',
    base: 'src/content',
    dest: 'target/a1.um',
    watch: true
  })

  const inputPage = new quantum.Page({
    file: file,
    content: {
      type: '',
      params: [],
      content: spec.select('input').content()
    }
  })

  const outputPage = new quantum.Page({
    file: file,
    content: {
      type: '',
      params: [],
      content: spec.select('output').content()
    }
  })

  const options = {
    languages: [css]
  }

  pageTransform.pageTransform(inputPage, options).should.eql(outputPage)
}

describe('css', () => {
  function transform () {
    return dom.create('div')
  }

  describe('examples', () => {
    function testExample (filename) {
      it(filename, () => {
        return quantum.read(path.join(__dirname, filename))
          .then(parsed => {
            checkSpec(quantum.select(parsed).select('spec'))
          })
      })
    }

    testExample('examples/class-basic.um')
    testExample('examples/class-nested.um')
    testExample('examples/extraclass-basic.um')
  })

  describe('hashEntry', () => {
    it('should hash to a string', () => {
      const selection = quantum.select({
        type: 'class',
        params: ['name1'],
        content: []
      })

      css.hashEntry(selection).should.be.a.string
    })

    it('should hash simple entries differently', () => {
      const selection1 = quantum.select({
        type: 'class',
        params: ['name1'],
        content: []
      })

      const selection2 = quantum.select({
        type: 'object',
        params: ['name2'],
        content: []
      })

      css.hashEntry(selection1).should.not.equal(css.hashEntry(selection2))
    })

    it('should return undefined if it reaches an entity not in the entityTypes list', () => {
      const selection = quantum.select({
        type: 'class',
        params: ['name1'],
        content: [
          {
            type: 'notInList',
            params: [],
            content: [
              {
                type: 'class',
                params: 'name2',
                content: []
              }
            ]
          }
        ]
      })

      should.not.exist(css.hashEntry(selection.select('notInList').select('class')))
    })

    describe('should hash differently for different names', () => {
      function test (type) {
        const selection1 = quantum.select({
          type: type,
          params: ['name1'],
          content: []
        })

        const selection2 = quantum.select({
          type: type,
          params: ['name2'],
          content: []
        })

        css.hashEntry(selection1).should.not.equal(css.hashEntry(selection2))
      }

      it('class', () => test('class'))
      it('extraclass', () => test('extraclass'))
      it('childclass', () => test('childclass'))
    })
  })

  describe('extractEntry', () => {
    it('should return an object with apiEntry and changes properties', () => {
      const selection = quantum.select({
        type: 'class',
        params: ['name1'],
        content: []
      })
      const res = css.extractEntry(selection)
      res.apiEntry.should.eql({
        entries: [
          { type: 'class', name: 'name1' }
        ]
      })
      res.changes.should.be.eql([])
    })

    it('should have defined parent properties if the selection has a parent', () => {
      const selection = quantum.select({
        type: 'class',
        params: ['name1'],
        content: [
          {
            type: 'class',
            params: ['name2'],
            content: []
          }
        ]
      }).select('class')

      const res = css.extractEntry(selection)
      res.apiEntry.should.eql({
        entries: [
          { type: 'class', name: 'name1' },
          { type: 'class', name: 'name2' }
        ]
      })
    })
  })

  describe('createHeaderDom', () => {
    it('should return undefined if the type is not supported', () => {
      const selection = quantum.select({
        type: 'header',
        params: ['unknown'],
        content: []
      })

      should.not.exist(css.createHeaderDom(selection, transform))
    })

    it('should do classes', () => {
      const selection = quantum.select({
        type: 'header',
        params: [],
        content: [
          {
            type: 'class',
            params: ['name'],
            content: []
          }
        ]
      })

      css.createHeaderDom(selection, transform).should.eql(
        dom.create('span')
          .class('qm-changelog-css-header')
          .add(dom.create('span').class('qm-changelog-css-class').text('name'))
      )
    })

    it('should do extra classes', () => {
      const selection = quantum.select({
        type: 'header',
        params: [],
        content: [
          {
            type: 'extraclass',
            params: ['name'],
            content: []
          }
        ]
      })

      css.createHeaderDom(selection, transform).should.eql(
        dom.create('span')
          .class('qm-changelog-css-header')
          .add(dom.create('span').class('qm-changelog-css-extraclass').text('name'))
      )
    })

    it('should do nesting', () => {
      const selection = quantum.select({
        type: 'header',
        params: ['class'],
        content: [
          {
            type: 'class',
            params: ['name1'],
            content: [
              {
                type: 'class',
                params: ['name2'],
                content: [
                  {
                    type: 'extraclass',
                    params: ['name3'],
                    content: []
                  }
                ]
              }
            ]
          }
        ]
      })

      css.createHeaderDom(selection, transform).should.eql(
        dom.create('span')
          .class('qm-changelog-css-header')
          .add(dom.create('span').class('qm-changelog-css-class').text('name1'))
          .add(dom.create('span').class('qm-changelog-css-class').text('name2'))
          .add(dom.create('span').class('qm-changelog-css-extraclass').text('name3'))
      )
    })
  })
})
