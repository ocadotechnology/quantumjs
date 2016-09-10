const chai = require('chai')
const quantum = require('quantum-js')
const dom = require('quantum-dom')
const header = require('../../lib/components/header')

chai.should()

describe('header', () => {
  it('should construct the header properly when there are no tags in the selection', () => {
    const type = 'test-type'
    const headerContent = dom.create('span').class('test-header-content')
    const selection = quantum.select({type: '', params: [], content: []})

    header(type, headerContent, selection).should.eql(
      dom.create('div')
        .class('qm-api-item-header qm-api-' + type + '-header')
        .add(headerContent.class('qm-api-header-details'))
        .add(dom.create('span').class('qm-api-header-tags'))
    )
  })

  it('should add tags correctly', () => {
    const type = 'test-type'
    const headerContent = dom.create('span').class('test-header-content')
    const selection = quantum.select({
      type: '',
      params: [],
      content: [
        {type: 'updated', params: [], content: []},
        {type: 'removed', params: [], content: []},
        {type: 'deprecated', params: [], content: []},
        {type: 'added', params: [], content: []}
      ]
    })

    header(type, headerContent, selection).should.eql(
      dom.create('div')
        .class('qm-api-item-header qm-api-' + type + '-header')
        .add(headerContent.class('qm-api-header-details'))
        .add(dom.create('span')
          .class('qm-api-header-tags')
          .add(dom.create('span').class('qm-api-tag qm-api-tag-added').text('added'))
          .add(dom.create('span').class('qm-api-tag qm-api-tag-deprecated').text('deprecated'))
          .add(dom.create('span').class('qm-api-tag qm-api-tag-removed').text('removed'))
          .add(dom.create('span').class('qm-api-tag qm-api-tag-updated').text('updated')))
    )
  })

  it('should add the updated tag when a child is changed in some way', () => {
    const type = 'test-type'
    const headerContent = dom.create('span').class('test-header-content')
    const selection = quantum.select({
      type: '',
      params: [],
      content: [
        {
          type: 'function',
          params: [],
          content: [
            {type: 'removed', params: [], content: []}
          ]
        }
      ]
    })

    header(type, headerContent, selection).should.eql(
      dom.create('div')
        .class('qm-api-item-header qm-api-' + type + '-header')
        .add(headerContent.class('qm-api-header-details'))
        .add(dom.create('span')
          .class('qm-api-header-tags')
          .add(dom.create('span').class('qm-api-tag qm-api-tag-updated').text('updated')))
    )
  })
})
