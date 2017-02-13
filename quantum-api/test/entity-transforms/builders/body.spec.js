describe('body', () => {
  const quantum = require('quantum-js')
  const dom = require('quantum-dom')
  const html = require('quantum-html')
  const body = require('../../../lib/entity-transforms/builders/body')
  const should = require('chai').should()

  const keys = [
    'default',
    'description',
    'extras',
    'groups'
  ]

  it('provides the correct things', () => {
    body.should.be.an('object')
    body.should.have.keys(keys)
  })

  keys.forEach(k => {
    it(`'${k}' looks like a transform`, () => {
      body[k].should.be.a('function')
      body[k].length.should.equal(2)
    })
  })

  describe('description', () => {
    const { description } = body
    it('creates a basic block using only the text content', () => {
      const selection = quantum.select({
        type: 'function',
        params: [],
        content: [
          'Some text only content',
          'That spans multiple lines'
        ]
      })

      function transformer () {}

      description(selection, transformer).should.eql(
        dom.create('div')
          .class('qm-api-description')
          .text('Some text only content\nThat spans multiple lines')
      )
    })

    it('creates a paragraph block when a @description section is found', () => {
      const descriptionBlock = {
        type: 'description',
        params: [],
        content: [
          'Some text only content',
          'That spans multiple lines'
        ]
      }

      const selection = quantum.select({
        type: 'function',
        params: [],
        content: [
          descriptionBlock
        ]
      })

      function transformer () {}

      description(selection, transformer).should.eql(
        dom.create('div')
          .class('qm-api-description')
          .add(html.paragraphTransform(quantum.select(descriptionBlock, transformer)))
      )
    })
  })

  describe('default', () => {
    const { default: dfault } = body
    it('creates a default value section if a @default entity exists', () => {
      const selection = quantum.select({
        type: 'function',
        params: [],
        content: [
          {
            type: 'default',
            params: [],
            content: [
              'True'
            ]
          }
        ]
      })

      function transformer (selection) {
        return selection.cs ? selection.cs() : selection
      }

      dfault(selection, transformer).should.eql(
        dom.create('div').class('qm-api-default')
          .add(dom.create('span').class('qm-api-default-key').text('Default: '))
          .add(dom.create('span').class('qm-api-default-value').text('True'))
      )
    })

    it('returns undefined if no @default entity exists', () => {
      const selection = quantum.select({
        type: 'function',
        params: [],
        content: []
      })

      function transformer () {}

      should.not.exist(dfault(selection, transformer))
    })
  })

  describe('extras', () => {
    const { extras } = body
    it('creates a default value section if an @extra entity exists', () => {
      const extra1 = {
        type: 'extra',
        params: [],
        content: [
          'Extra content 1'
        ]
      }

      const extra2 = {
        type: 'extra',
        params: [],
        content: [
          'Extra content 2'
        ]
      }

      const selection = quantum.select({
        type: 'function',
        params: [],
        content: [
          extra1,
          extra2
        ]
      })

      function transformer () {}

      extras(selection, transformer).should.eql(
        dom.create('div').class('qm-api-extras')
          .add(dom.create('div').class('qm-api-extra').add(html.paragraphTransform(quantum.select(extra1), transformer)))
          .add(dom.create('div').class('qm-api-extra').add(html.paragraphTransform(quantum.select(extra2), transformer)))
      )
    })

    it('returns undefined if no @extra entity exists', () => {
      const selection = quantum.select({
        type: 'function',
        params: [],
        content: []
      })

      function transformer () {}

      should.not.exist(extras(selection, transformer))
    })
  })

  describe('groups', () => {
    const { groups, description } = body
    it('creates a default value section if a @group entity exists', () => {
      const group1 = {
        type: 'group',
        params: ['Group 1'],
        content: [
          'Group description 1'
        ]
      }

      const group2 = {
        type: 'group',
        params: ['Group 2'],
        content: [
          'Group description 2'
        ]
      }

      const selection = quantum.select({
        type: 'function',
        params: [],
        content: [
          group1,
          group2
        ]
      })

      function transformer (selection) {
        return dom.create('span').text(selection.cs())
      }

      return groups(selection, transformer).should.eql(
        dom.create('div').class('qm-api-groups')
          .add(dom.create('div').class('qm-api-group')
            .add(dom.create('div').class('qm-api-group-header qm-header-font').text('Group 1'))
            .add(dom.create('div').class('qm-api-group-content')
              .add(description(quantum.select(group1), transformer))))
          .add(dom.create('div').class('qm-api-group')
            .add(dom.create('div').class('qm-api-group-header qm-header-font').text('Group 2'))
            .add(dom.create('div').class('qm-api-group-content')
              .add(description(quantum.select(group2), transformer))))
      )
    })

    it('handles description sections', () => {
      const group1 = {
        type: 'group',
        params: ['Group 1'],
        content: [
          {
            type: 'description',
            params: [],
            content: ['Group description 1']
          }
        ]
      }

      const group2 = {
        type: 'group',
        params: ['Group 2'],
        content: [
          {
            type: 'description',
            params: [],
            content: ['Group description 2']
          }
        ]
      }

      const selection = quantum.select({
        type: 'function',
        params: [],
        content: [
          group1,
          group2
        ]
      })

      function transformer () {}

      return groups(selection, transformer).should.eql(
        dom.create('div').class('qm-api-groups')
          .add(dom.create('div').class('qm-api-group')
            .add(dom.create('div').class('qm-api-group-header qm-header-font').text('Group 1'))
            .add(dom.create('div').class('qm-api-group-content')
              .add(description(quantum.select(group1), transformer))))
          .add(dom.create('div').class('qm-api-group')
            .add(dom.create('div').class('qm-api-group-header qm-header-font').text('Group 2'))
            .add(dom.create('div').class('qm-api-group-content')
              .add(description(quantum.select(group2), transformer))))
      )
    })

    it('returns undefined if no @group entity exists', () => {
      const selection = quantum.select({
        type: 'function',
        params: [],
        content: []
      })

      function transformer () {}

      should.not.exist(groups(selection, transformer))
    })
  })
})
