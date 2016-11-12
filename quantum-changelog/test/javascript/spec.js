'use strict'

const chai = require('chai')
const pageTransform = require('../../lib/page-transform')
const javascript = require('../../lib/languages/javascript')
const path = require('path')
const quantum = require('quantum-js')

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
    languages: [javascript]
  }


  pageTransform.pageTransform(inputPage, options).should.eql(outputPage)

}

describe('javascript', () => {
  describe('examples', () => {
    function testExample (filename) {
      it(filename, () => {
        return quantum.read(path.join(__dirname, filename))
          .then(parsed => {
            checkSpec(quantum.select(parsed).select('spec'))
          })
        })
    }

    testExample('examples/function-basic.um')
    testExample('examples/function-return-type-change.um')
    testExample('examples/function-no-return.um')
    testExample('examples/method-basic.um')
    testExample('examples/constructor-basic.um')
    testExample('examples/object-basic.um')
  })

  describe('hashEntry', () => {
    it('should hash to a string', () => {
      const selection = quantum.select({
        type: 'function',
        params: ['name1'],
        content: []
      })

      javascript.hashEntry(selection).should.be.a.string
    })

    it('should hash simple entries differently', () => {
      const selection1 = quantum.select({
        type: 'function',
        params: ['name1'],
        content: []
      })

      const selection2 = quantum.select({
        type: 'object',
        params: ['name2'],
        content: []
      })

      javascript.hashEntry(selection1).should.not.equal(javascript.hashEntry(selection2))
    })

    it('should return undefined if it reaches an entity not in the entityTypes list', () => {
      const selection = quantum.select({
        type: 'object',
        params: ['name1'],
        content: [
          {
            type: 'notInList',
            params: [],
            content: [
              {
                type: 'function',
                params: 'name2',
                content: []
              }
            ]
          }
        ]
      })

      should.not.exist(javascript.hashEntry(selection.select('notInList').select('function')))
    })

    describe('should hash differently for different params', () => {
      function test(type) {
        const selection1 = quantum.select({
          type: type,
          params: ['name1'],
          content: [
            {
              type: 'param',
              params: ['param1'],
              content: []
            }
          ]
        })

        const selection2 = quantum.select({
          type: type,
          params: ['name2'],
          content: [
            {
              type: 'param',
              params: ['param1'],
              content: []
            },
            {
              type: 'param',
              params: ['param2'],
              content: []
            }
          ]
        })

        javascript.hashEntry(selection1).should.not.equal(javascript.hashEntry(selection2))
      }

      it('constructor', () => test('constructor'))
      it('function', () => test('function'))
      it('method', () => test('method'))
    })

    describe('should hash differently for different names', () => {
      function test(type) {
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

        javascript.hashEntry(selection1).should.not.equal(javascript.hashEntry(selection2))
      }

      it('object', () => test('object'))
      it('prototype', () => test('prototype'))
      it('event', () => test('event'))
      it('constructor', () => test('constructor'))
      it('function', () => test('function'))
      it('method', () => test('method'))
      it('property', () => test('property'))
      it('property?', () => test('property?'))

    })
  })

})
