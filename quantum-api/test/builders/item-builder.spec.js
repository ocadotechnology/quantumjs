const chai = require('chai')
const quantum = require('quantum-js')
const dom = require('quantum-dom')
const header = require('../../lib/components/header')
const collapsible = require('../../lib/components/collapsible')
const itemBuilder = require('../../lib/builders/item-builder')
const headerBuilders = require('../../lib/builders/header-builders')
const noticeBuilder = require('../../lib/builders/notice-builder')

chai.should()

describe('item-builder', () => {
  it('should return a function', () => {
    itemBuilder({}).should.be.a.function
  })

  it('the returned function should return a piece of virtual dom', () => {
    const selection = quantum.select({
      type: 'function',
      params: [],
      content: []
    })

    itemBuilder({})(selection).should.eql(
      dom.create('div').class('qm-api-item-content')
    )
  })

  it('should render a notice', () => {
    const selection = quantum.select({
      type: 'function',
      params: [],
      content: [
        {type: 'deprecated', params: [], content: ['Warning']}
      ]
    })

    function transformer (selection) {
      return dom.create('div').text(quantum.select.isEntity(selection) ? selection.cs() : selection)
    }

    const deprecatedNoticeBuilder = noticeBuilder('deprecated', 'Deprecated')

    itemBuilder({})(selection, transformer).should.eql(
      dom.create('div').class('qm-api-item-content')
        .add(deprecatedNoticeBuilder(selection, transformer))
    )
  })

  it('should render a header', () => {
    const selection = quantum.select({
      type: 'function',
      params: ['Name'],
      content: []
    })

    function transformer (selection) {
      return dom.create('div').text(quantum.select.isEntity(selection) ? selection.cs() : selection)
    }

    const headerBlock = dom.create('div')
      .class('qm-api-item-head')
      .add(header('name', headerBuilders.nameHeaderDetails(selection), selection))
    const contentBlock = dom.create('div')
      .class('qm-api-item-content')

    itemBuilder({
      header: headerBuilders.nameHeader()
    })(selection, transformer).should.eql(
      collapsible('', headerBlock, contentBlock)
    )
  })

  it('should add the no description class even when tags are present', () => {
    const selection = quantum.select({
      type: 'function',
      params: ['Name'],
      content: [
        {type: 'added', params: [], content: []}
      ]
    })

    function transformer (selection) {
      return dom.create('div').text(quantum.select.isEntity(selection) ? selection.cs() : selection)
    }

    const headerBlock = dom.create('div')
      .class('qm-api-item-head')
      .add(header('name', headerBuilders.nameHeaderDetails(selection), selection))
    const contentBlock = dom.create('div')
      .class('qm-api-item-content')

    itemBuilder({
      header: headerBuilders.nameHeader()
    })(selection, transformer).should.eql(
      collapsible('', headerBlock, contentBlock)
    )
  })

  it('should render an optional header', () => {
    const selection = quantum.select({
      type: 'function?',
      params: ['Name'],
      content: []
    })

    function transformer (selection) {
      return dom.create('div').text(quantum.select.isEntity(selection) ? selection.cs() : selection)
    }

    const headerBlock = dom.create('div')
      .class('qm-api-item-head qm-api-optional')
      .add(header('name', headerBuilders.nameHeaderDetails(selection), selection))
    const contentBlock = dom.create('div')
      .class('qm-api-item-content')

    const other = itemBuilder({
      class: 'other',
      header: headerBuilders.typeHeader()
    })

    itemBuilder({
      header: headerBuilders.nameHeader(),
      renderAsOther: {
        Other: other
      }
    })(selection, transformer).should.eql(
      collapsible('', headerBlock, contentBlock)
    )
  })

  it('should render as another thing', () => {
    const selection = quantum.select({
      type: 'function',
      params: ['Name', 'Other'],
      content: []
    })

    function transformer (selection) {
      return dom.create('div').text(quantum.select.isEntity(selection) ? selection.cs() : selection)
    }

    const headerBlock = dom.create('div')
      .class('qm-api-item-head')
      .add(headerBuilders.typeHeader()(selection, transformer))
    const contentBlock = dom.create('div')
      .class('qm-api-item-content')

    const other = itemBuilder({
      class: 'other',
      header: headerBuilders.typeHeader()
    })

    itemBuilder({
      class: 'function',
      header: headerBuilders.nameHeader(),
      renderAsOther: {
        Other: other
      }
    })(selection, transformer).should.eql(
      collapsible('function', headerBlock, contentBlock)
    )
  })
})
