'use strict'

const path = require('path')

const chai = require('chai')
const quantum = require('quantum-js')
const dom = require('quantum-dom')

const changelogPageTransform = require('../../../lib/page-transforms/changelog')
const javascript = require('../../../lib/languages/javascript')

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
    languages: [javascript()]
  }

  changelogPageTransform.pageTransform(inputPage, options).should.eql(outputPage)
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
    testExample('examples/property-basic.um')
    testExample('examples/event-basic.um')
    testExample('examples/prototype-basic.um')
    testExample('examples/property-on-object.um')
  })

  describe('hashEntry', () => {
    it('should hash to a string', () => {
      const selection = quantum.select({
        type: 'function',
        params: ['name1'],
        content: []
      })

      javascript().changelog.hashEntry(selection).should.be.a.string
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

      javascript().changelog.hashEntry(selection1).should.not.equal(javascript().changelog.hashEntry(selection2))
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

      should.not.exist(javascript().changelog.hashEntry(selection.select('notInList').select('function')))
    })

    describe('should hash differently for different params', () => {
      function test (type) {
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

        javascript().changelog.hashEntry(selection1).should.not.equal(javascript().changelog.hashEntry(selection2))
      }

      it('constructor', () => test('constructor'))
      it('function', () => test('function'))
      it('method', () => test('method'))
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

        javascript().changelog.hashEntry(selection1).should.not.equal(javascript().changelog.hashEntry(selection2))
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

  describe('createHeaderDom', () => {
    function transform () {
      return dom.create('div')
    }

    it('should return undefined if there is no content', () => {
      const selection = quantum.select({
        type: 'header',
        params: ['javascript'],
        content: []
      })

      should.not.exist(javascript().changelog.createHeaderDom(selection, transform))
    })

    it('should return a virtual dom element', () => {
      const selection = quantum.select({
        type: 'header',
        params: ['javascript'],
        content: [
          {
            type: 'function',
            params: ['name'],
            content: []
          }
        ]
      })

      javascript().changelog.createHeaderDom(selection, transform).should.be.an.instanceof(dom.Element)
      javascript().changelog.createHeaderDom(selection, transform).class().should.equal('qm-changelog-javascript-header')
    })

    describe('should render object types correctly', () => {
      function test (type) {
        it(type, () => {
          const selection = quantum.select({
            type: 'header',
            params: ['javascript'],
            content: [
              {
                type: type,
                params: ['name'],
                content: []
              }
            ]
          })

          function transform () {
            return dom.create('div')
          }

          javascript().changelog.createHeaderDom(selection, transform).should.eql(
            dom.create('span').class('qm-changelog-javascript-header')
              .add(dom.create('span').class('qm-changelog-javascript-' + type)
                .add(dom.create('span').class('qm-changelog-javascript-name').text('name'))
              )
          )
        })
      }

      test('object')
      test('prototype')
    })

    describe('should render function types correctly', () => {
      function test (type) {
        it(type, () => {
          const selection = quantum.select({
            type: 'header',
            params: ['javascript'],
            content: [
              {
                type: type,
                params: ['name'],
                content: [
                  {
                    type: 'param',
                    params: ['param1', 'String'],
                    content: []
                  }
                ]
              }
            ]
          })

          function transform () {
            return dom.create('div')
          }

          javascript().changelog.createHeaderDom(selection, transform).should.eql(
            dom.create('span').class('qm-changelog-javascript-header')
              .add(dom.create('span').class('qm-changelog-javascript-' + type)
                .add(dom.create('span').class('qm-changelog-javascript-name').text('name'))
                .add(dom.create('span').class('qm-changelog-javascript-params')
                  .add(dom.create('span').class('qm-changelog-javascript-param')
                    .add(dom.create('span').class('qm-changelog-javascript-param-name').text('param1'))
                    .add(dom.create('span').class('qm-changelog-javascript-param-type').text('String')))))
          )
        })
      }

      test('function')
      test('method')
      test('constructor')
    })

    describe('should render property types correctly', () => {
      function test (type) {
        it(type, () => {
          const selection = quantum.select({
            type: 'header',
            params: ['javascript'],
            content: [
              {
                type: type,
                params: ['name', 'type'],
                content: []
              }
            ]
          })

          function transform () {
            return dom.create('div')
          }

          javascript().changelog.createHeaderDom(selection, transform).should.eql(
            dom.create('span').class('qm-changelog-javascript-header')
              .add(dom.create('span').class('qm-changelog-javascript-' + type)
                .add(dom.create('span').class('qm-changelog-javascript-name').text('name'))
                .add(dom.create('span').class('qm-changelog-javascript-type').text('type'))
              )
          )
        })
      }

      test('property')
      test('event')
      test('property?')
    })
  })
})