describe('changelog', () => {
  const should = require('chai').should()
  const path = require('path')
  const quantum = require('quantum-js')
  const dom = require('quantum-dom')
  const header = require('../../../lib/entity-transforms/builders/header')
  const changelogFileTransform = require('../../../lib/file-transforms/changelog')
  const css = require('../../../lib/languages/css')

  function transformer () {}
  const options = {}

  it('exports the correct things', () => {
    const cssChangelog = css(options).changelog
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
      languages: [css()]
    }

    changelogFileTransform.fileTransform(inputFile, options).should.eql(outputFile)
  }

  describe('createHeaderDom', () => {
    function nameBuilder (selection) {
      const name = selection.param(0)
      return dom.create('span')
        .class('qm-api-css-header-name')
        .attr('id', name ? name.toLowerCase() : undefined)
        .add(name || '')
    }

    const { createHeaderDom } = css(options).changelog
    it('creates a header for a single entity', () => {
      const selection = {
        type: 'class',
        params: ['class-name'],
        content: []
      }

      const headerSel = quantum.select({
        type: 'header',
        params: [],
        content: [selection]
      })

      createHeaderDom(headerSel, transformer).should.eql(dom.create('span')
        .class('qm-changelog-css-header')
          .add(dom.create('span')
            .class('qm-changelog-css-class')
            .add(header('class', nameBuilder)(quantum.select(selection), transformer))))
    })

    it('creates a header for nested entites', () => {
      const child2 = {
        type: 'extraClass',
        params: [],
        content: []
      }

      const child1 = {
        type: 'extraClass',
        params: ['some-extra-class'],
        content: [child2]
      }

      const selection = {
        type: 'class',
        params: ['class-name'],
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
        .class('qm-changelog-css-header')
          .add(dom.create('span')
            .class('qm-changelog-css-class')
            .add(header('class', nameBuilder)(quantum.select(selection), transformer)))
          .add(dom.create('span')
            .class('qm-changelog-css-extra-class')
            .add(header('extra-class', nameBuilder)(quantum.select(child1), transformer)))
          .add(dom.create('span')
            .class('qm-changelog-css-extra-class')
            .add(header('extra-class', nameBuilder)(quantum.select(child2), transformer))))
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

    testExample('examples/class-basic.um')
    testExample('examples/class-nested.um')
    testExample('examples/extraclass-basic.um')
    testExample('examples/extraclass-nested.um')
  })
})
