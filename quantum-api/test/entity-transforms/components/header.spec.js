describe('header', () => {
  const quantum = require('quantum-core')
  const dom = require('quantum-dom')
  const header = require('../../../lib/entity-transforms/components/header')
  it('constructs the header properly when there are no tags in the selection', () => {
    const type = 'test-type'
    const headerContent = dom.create('span').class('test-header-content')
    const selection = quantum.select({type: '', params: [], content: []})

    header(type, headerContent, selection).should.eql(
      dom.create('div')
        .class('qm-api-item-header qm-api-item-header-' + type)
        .add(headerContent.class('qm-api-header-details'))
        .add(dom.create('span').class('qm-api-header-tags'))
    )
  })

  it('adds tags correctly', () => {
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
        .class('qm-api-item-header qm-api-item-header-' + type)
        .add(headerContent.classed('qm-api-header-details qm-api-added qm-api-updated qm-api-deprecated qm-api-removed', true))
        .add(dom.create('span').class('qm-api-header-tags')
          .add(dom.create('span').class('qm-api-tag qm-api-tag-added').text('added'))
          .add(dom.create('span').class('qm-api-tag qm-api-tag-updated').text('updated'))
          .add(dom.create('span').class('qm-api-tag qm-api-tag-deprecated').text('deprecated'))
          .add(dom.create('span').class('qm-api-tag qm-api-tag-removed').text('removed')))
    )
  })
})
