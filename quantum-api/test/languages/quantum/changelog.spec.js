describe('changelog', () => {
  const should = require('chai').should()
  const path = require('path')
  const quantum = require('quantum-js')
  const dom = require('quantum-dom')
  const header = require('../../../lib/entity-transforms/builders/header')
  const changelogFileTransform = require('../../../lib/file-transforms/changelog')
  const umLanguage = require('../../../lib/languages/quantum')

  function transformer () {}
  const options = {}

  it('exports the correct things', () => {
    const cssChangelog = umLanguage(options).changelog
    cssChangelog.should.have.keys([
      'entityTypes',
      'createHeaderDom'
    ])
    cssChangelog.entityTypes.should.be.an('array')
    cssChangelog.createHeaderDom.should.be.a('function')
  })

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
      languages: [umLanguage()]
    }

    changelogFileTransform.fileTransform(inputFile, options).should.eql(outputFile)
  }

  describe('createHeaderDom', () => {
    function nameBuilder (selection) {
      const name = selection.param(0)
      return dom.create('span')
        .class('qm-api-quantum-header-entity-name')
        .attr('id', name ? name.toLowerCase() : undefined)
        .add(name || '')
    }

    const { createHeaderDom } = umLanguage(options).changelog
    it('creates a header for a single entity', () => {
      const selection = {
        type: 'entity',
        params: ['entity-name'],
        content: []
      }

      const headerSel = quantum.select({
        type: 'header',
        params: [],
        content: [selection]
      })

      createHeaderDom(headerSel, transformer).should.eql(dom.create('span')
        .class('qm-changelog-quantum-header')
          .add(dom.create('span')
            .class('qm-changelog-quantum-entity')
            .add(header('entity', nameBuilder)(quantum.select(selection), transformer))))
    })

    it('creates a header for nested entites', () => {
      const child2 = {
        type: 'entity',
        params: [],
        content: []
      }

      const child1 = {
        type: 'entity',
        params: ['some-entity'],
        content: [child2]
      }

      const selection = {
        type: 'entity',
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

      createHeaderDom(headerSel, transformer).should.eql(dom.create('span')
        .class('qm-changelog-quantum-header')
          .add(dom.create('span')
            .class('qm-changelog-quantum-entity')
            .add(header('entity', nameBuilder)(quantum.select(selection), transformer)))
          .add(dom.create('span')
            .class('qm-changelog-quantum-entity')
            .add(header('entity', nameBuilder)(quantum.select(child1), transformer)))
          .add(dom.create('span')
            .class('qm-changelog-quantum-entity')
            .add(header('entity', nameBuilder)(quantum.select(child2), transformer))))
    })

    it('creates a header with params', () => {
      const child1 = {
        type: 'param',
        params: ['param'],
        content: []
      }

      const child2 = {
        type: 'param?',
        params: ['optional'],
        content: []
      }

      const child3 = {
        type: 'param',
        params: [''],
        content: []
      }

      const selection = {
        type: 'entity',
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

      function entityBuilder (selection, transformer) {
        const name = selection.param(0)
        return dom.create('span')
          .class('qm-api-quantum-header-entity-name')
          .attr('id', name ? name.toLowerCase() : undefined)
          .add(name || '')
          .add(dom.create('span').class('qm-api-quantum-header-entity-params')
            .add(paramBuilder(quantum.select(child1), transformer))
            .add(paramBuilder(quantum.select(child2), transformer))
            .add(paramBuilder(quantum.select(child3), transformer)))
      }

      function paramBuilder (selection, transformer) {
        const name = selection.param(0)
        const isOptional = selection.type()[selection.type().length - 1] === '?'
        return dom.create('span')
          .class('qm-api-quantum-header-entity-param')
          .classed('qm-api-optional', isOptional)
          .add(dom.create('span').class('qm-api-quantum-header-entity-param-name')
            .text(name || ''))
      }

      createHeaderDom(headerSel, transformer).should.eql(dom.create('span')
        .class('qm-changelog-quantum-header')
          .add(dom.create('span')
            .class('qm-changelog-quantum-entity')
            .add(header('entity', entityBuilder)(quantum.select(selection), transformer))))
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
  })

  describe('examples', () => {
    function testExample (filename) {
      it(filename, () => {
        return quantum.read(path.join(__dirname, filename))
          .then(parsed => {
            checkSpec(quantum.select(parsed).select('spec'))
          })
      })
    }

    testExample('examples/entity.um')
  })
})
