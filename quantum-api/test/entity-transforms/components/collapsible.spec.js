describe('collapsible', () => {
  const dom = require('quantum-dom')
  const collapsible = require('../../../lib/entity-transforms/components/collapsible')
  // more of a regression test than anything
  it('uses the passed in collapsibleClass, header and content', () => {
    const collapsibleClass = 'extra-class'
    const header = dom.create('div').class('header')
    const content = dom.create('div').class('content')

    collapsible(collapsibleClass, header, content).should.eql(
      dom.create('div')
        .class('qm-api-item ' + collapsibleClass)
        .classed('qm-api-collapsible', true)
        .classed('qm-api-collapsible-open', false)
        .add(dom.create('div').class('qm-api-collapsible-heading')
          .add(dom.create('div').class('qm-api-collapsible-toggle')
            .add(dom.create('i').class('qm-api-chevron-icon')))
          .add(dom.create('div').class('qm-api-collapsible-head')
            .add(header)))
        .add(dom.create('div').class('qm-api-collapsible-content')
          .add(content))
    )
  })
})
