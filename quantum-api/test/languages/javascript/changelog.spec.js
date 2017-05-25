describe('changelog', () => {
  const should = require('chai').should()
  const dom = require('quantum-dom')
  const header = require('../../../lib/entity-transforms/builders/header')
  const path = require('path')
  const quantum = require('quantum-js')
  const changelogFileTransform = require('../../../lib/file-transforms/changelog')
  const javascript = require('../../../lib/languages/javascript')

  describe('createHeaderDom', () => {
    const options = {}
    function transformer () {}

    const { createHeaderDom } = javascript(options).changelog
    it('creates a header for a single entity', () => {
      function functionNamebuilder (selection) {
        const name = selection.param(0)
        return dom.create('span')
          .class('qm-api-javascript-header-function-signature')
          .attr('id', name ? name.toLowerCase() : undefined)
          .add(dom.create('span')
            .class('qm-api-javascript-header-function-name')
            .text(selection.type() === 'constructor' ? 'constructor' : name))
          .add(dom.create('span')
            .class('qm-api-javascript-header-function-args'))
      }

      const selection = {
        type: 'function',
        params: ['function-name'],
        content: []
      }

      const headerSel = quantum.select({
        type: 'header',
        params: [],
        content: [selection]
      })

      createHeaderDom(headerSel, transformer).should.eql(dom.create('span')
        .class('qm-changelog-javascript-header')
          .add(dom.create('span')
            .class('qm-changelog-javascript-function')
            .add(header('function', functionNamebuilder)(quantum.select(selection), transformer))))
    })

    it('creates a header for nested entites', () => {
      const child3 = {
        type: 'property',
        params: [],
        content: []
      }

      const child2 = {
        type: 'property',
        params: ['some-prop'],
        content: [child3]
      }

      const child1 = {
        type: 'property',
        params: ['some-object', 'Object'],
        content: [child2]
      }

      const selection = {
        type: 'object',
        params: ['entity-name'],
        content: [
          child1
        ]
      }

      const headerSel = quantum.select({
        type: 'header',
        params: [],
        content: [selection]
      })

      function objectHeaderBuilder (selection, transformer) {
        const name = selection.param(0)
        return dom.create('span')
          .class('qm-api-javascript-header-object')
          .attr('id', name ? name.toLowerCase() : undefined)
          .add(dom.create('span').class('qm-api-javascript-header-object-name').text(name || ''))
      }

      function propertyHeaderBuilder (selection, transformer) {
        const name = selection.param(0)
        return dom.create('span')
          .class('qm-api-javascript-header-property')
          .attr('id', name ? name.toLowerCase() : undefined)
          .add(dom.create('span').class('qm-api-javascript-header-property-name').text(name || ''))
          .add(dom.create('span').class('qm-api-javascript-header-property-type'))
      }

      createHeaderDom(headerSel, transformer).should.eql(dom.create('span')
        .class('qm-changelog-javascript-header')
          .add(dom.create('span')
            .class('qm-changelog-javascript-object')
            .add(header('object', objectHeaderBuilder)(quantum.select(selection), transformer)))
          .add(dom.create('span')
            .class('qm-changelog-javascript-property')
            .add(header('object', objectHeaderBuilder)(quantum.select(child1), transformer)))
          .add(dom.create('span')
            .class('qm-changelog-javascript-property')
            .add(header('property', propertyHeaderBuilder)(quantum.select(child2), transformer)))
          .add(dom.create('span')
            .class('qm-changelog-javascript-property')
            .add(header('property', propertyHeaderBuilder)(quantum.select(child3), transformer))))
    })

    it('creates a header with args', () => {
      const child1 = {
        type: 'arg',
        params: ['param'],
        content: []
      }

      const child2 = {
        type: 'arg?',
        params: ['optional'],
        content: []
      }

      const child3 = {
        type: 'arg',
        params: [''],
        content: []
      }

      const selection = {
        type: 'function',
        params: ['entity-name'],
        content: [
          child1,
          child2,
          child3
        ]
      }

      const headerSel = quantum.select({
        type: 'header',
        params: [],
        content: [selection]
      })

      function paramBuilder (selection, transformer) {
        const name = selection.param(0)
        const isOptional = selection.type()[selection.type().length - 1] === '?'
        return dom.create('span')
          .class('qm-api-javascript-header-function-arg')
          .classed('qm-api-optional', isOptional)
          .add(dom.create('span').class('qm-api-javascript-header-function-arg-name')
            .text(name || ''))
          .add(dom.create('span').class('qm-api-javascript-header-function-arg-type'))
      }

      function functionBuilder (selection, transformer) {
        const name = selection.param(0)

        const nameSel = dom.create('span')
          .class('qm-api-javascript-header-function-name')
          .add(name || '')

        return dom.create('span')
          .class('qm-api-javascript-header-function-signature')
          .attr('id', name ? name.toLowerCase() : undefined)
          .add(nameSel)
          .add(dom.create('span').class('qm-api-javascript-header-function-args')
            .add(paramBuilder(quantum.select(child1), transformer))
            .add(paramBuilder(quantum.select(child2), transformer))
            .add(paramBuilder(quantum.select(child3), transformer)))
      }

      createHeaderDom(headerSel, transformer).should.eql(dom.create('span')
        .class('qm-changelog-javascript-header')
          .add(dom.create('span')
            .class('qm-changelog-javascript-function')
            .add(header('function', functionBuilder)(quantum.select(selection), transformer))))
    })

    it('returns nothing when there are no supported entityTypes', () => {
      const headerSel = quantum.select({
        type: 'header',
        params: [],
        content: [{
          type: 'something',
          params: ['name'],
          content: []
        }]
      })

      should.not.exist(createHeaderDom(headerSel, transformer))
    })

    it('renders a constructor correctly', () => {
      function paramBuilder (selection, transformer) {
        const name = selection.param(0)
        const isOptional = selection.type()[selection.type().length - 1] === '?'
        return dom.create('span')
          .class('qm-api-javascript-header-function-arg')
          .classed('qm-api-optional', isOptional)
          .add(dom.create('span').class('qm-api-javascript-header-function-arg-name')
            .text(name || ''))
          .add(dom.create('span').class('qm-api-javascript-header-function-arg-type'))
      }

      function constructorBuilder (selection, transformer) {
        const name = 'SomeProto'

        const nameSel = dom.create('span')
          .class('qm-api-javascript-header-constructor-name')
          .add(name || '')

        return dom.create('span')
          .class('qm-api-javascript-header-constructor-signature')
          .attr('id', name ? name.toLowerCase() : undefined)
          .add(nameSel)
          .add(dom.create('span').class('qm-api-javascript-header-function-args')
            .add(paramBuilder(quantum.select(child1), transformer))
            .add(paramBuilder(quantum.select(child2), transformer))
            .add(paramBuilder(quantum.select(child3), transformer)))
      }

      const child1 = {
        type: 'arg',
        params: ['param'],
        content: []
      }

      const child2 = {
        type: 'arg?',
        params: ['optional'],
        content: []
      }

      const child3 = {
        type: 'arg',
        params: [''],
        content: []
      }

      const construct = {
        type: 'constructor',
        params: [],
        content: [
          child1,
          child2,
          child3
        ]
      }

      const proto = {
        type: 'prototype',
        params: ['SomeProto'],
        content: [
          construct
        ]
      }

      const headerSel = quantum.select({
        type: 'header',
        params: [],
        content: [proto]
      })

      createHeaderDom(headerSel, transformer).should.eql(dom.create('span')
        .class('qm-changelog-javascript-header')
          .add(dom.create('span')
            .class('qm-changelog-javascript-constructor')
            .add(header('constructor', constructorBuilder)(quantum.select(construct), transformer))))
    })
  })

  describe('examples', () => {
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
        languages: [javascript()]
      }

      changelogFileTransform.fileTransform(inputFile, options).should.eql(outputFile)
    }

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
})
