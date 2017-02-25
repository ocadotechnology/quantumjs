describe('item', () => {
  const should = require('chai').should()
  const quantum = require('quantum-js')
  const dom = require('quantum-dom')
  const collapsible = require('../../../lib/entity-transforms/components/collapsible')
  const item = require('../../../lib/entity-transforms/builders/item')
  const headerBuilder = require('../../../lib/entity-transforms/builders/header')
  const notice = require('../../../lib/entity-transforms/builders/notice')

  function transformer (selection) {
    return dom.create('div').text(quantum.isEntity(selection) ? selection.cs() : selection)
  }

  function headerDetails (selection) {
    return dom.create('div').class('test').text(selection.cs())
  }

  it('returns a function', () => {
    item({}).should.be.a('function')
  })

  it('the returned function returns undefined when there is no content', () => {
    const selection = quantum.select({
      type: 'function',
      params: [],
      content: []
    })

    should.not.exist(item({})(selection))
  })

  it('the returned function returns undefined when there are no builders and header is not defined', () => {
    const selection = quantum.select({
      type: 'function',
      params: [],
      content: [
        'Content'
      ]
    })

    should.not.exist(item({})(selection))
  })

  it('the returned function returns a piece of virtual dom when content is defined', () => {
    const selection = quantum.select({
      type: 'function',
      params: [],
      content: [
        'Content'
      ]
    })

    item({content: [ (selection) => selection.cs() ]})(selection).should.eql(
      dom.create('div').class('qm-api-item-content').text('Content')
    )
  })

  it('renders a notice', () => {
    const selection = quantum.select({
      type: 'function',
      params: [],
      content: [
        {type: 'deprecated', params: [], content: ['Warning']}
      ]
    })

    const deprecatedNoticeBuilder = notice('deprecated', 'Deprecated')

    item({})(selection, transformer).should.eql(
      dom.create('div').class('qm-api-item-content')
        .add(deprecatedNoticeBuilder(selection, transformer))
    )
  })

  it('renders a header', () => {
    const selection = quantum.select({
      type: 'function',
      params: ['Name'],
      content: []
    })

    const headerBlock = dom.create('div')
      .class('qm-api-item-head')
      .add(headerBuilder('name', headerDetails)(selection, transformer))

    item({
      header: headerBuilder('name', headerDetails)
    })(selection, transformer).should.eql(
      collapsible('', headerBlock, undefined)
    )
  })

  it('adds the no description class even when tags are present', () => {
    const selection = quantum.select({
      type: 'function',
      params: ['Name'],
      content: [
        {type: 'added', params: [], content: []}
      ]
    })

    const headerBlock = dom.create('div')
      .class('qm-api-item-head')
      .add(headerBuilder('name', headerDetails)(selection, transformer))

    item({
      header: headerBuilder('name', headerDetails)
    })(selection, transformer).should.eql(
      collapsible('', headerBlock, undefined)
    )
  })

  it('renders an optional header', () => {
    const selection = quantum.select({
      type: 'function?',
      params: ['Name'],
      content: []
    })

    const headerBlock = dom.create('div')
      .class('qm-api-item-head qm-api-optional')
      .add(headerBuilder('other', headerDetails)(selection, transformer))

    const other = item({
      class: 'other',
      header: headerBuilder('other', headerDetails)
    })

    item({
      header: headerBuilder('other', headerDetails),
      renderAsOther: {
        Other: other
      }
    })(selection, transformer).should.eql(
      collapsible('', headerBlock, undefined)
    )
  })

  it('renders as another thing', () => {
    const selection = quantum.select({
      type: 'function',
      params: ['Name', 'Other'],
      content: []
    })

    const headerBlock = dom.create('div')
      .class('qm-api-item-head')
      .add(headerBuilder('other', headerDetails)(selection, transformer))

    const other = item({
      class: 'other',
      header: headerBuilder('other', headerDetails)
    })

    item({
      class: 'function',
      header: headerBuilder('function', headerDetails),
      renderAsOther: {
        Other: other
      }
    })(selection, transformer).should.eql(
      collapsible('function', headerBlock, undefined)
    )
  })
})
