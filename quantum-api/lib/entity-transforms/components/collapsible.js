'use strict'

const dom = require('quantum-dom')

/* Creates a collapsible from the header and content supplied */
module.exports = function collapsible (collapsibleClass, header, content, isCollapsible, isCollapsed) {
  return dom.create('div')
    .class('qm-api-item ' + collapsibleClass)
    .classed('qm-api-collapsible', isCollapsible)
    .classed('qm-api-collapsible-open', !isCollapsed || !isCollapsible)
    .add(dom.create('div').class('qm-api-collapsible-heading')
      .add(dom.create('div').class('qm-api-collapsible-toggle')
        .add(dom.create('i').class('qm-api-chevron-icon')))
      .add(dom.create('div').class('qm-api-collapsible-head')
        .add(header)))
    .add(dom.create('div').class('qm-api-collapsible-content')
      .add(content))
}
