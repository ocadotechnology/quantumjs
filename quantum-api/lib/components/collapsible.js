'use strict'

const dom = require('quantum-dom')

/* Creates a collapsible from the header and content supplied */
module.exports = function collapsible (collapsibleClass, header, content) {
  return dom.create('div').class('qm-api-collapsible qm-api-item ' + collapsibleClass)
    .add(dom.create('div').class('qm-api-collapsible-heading')
      .add(dom.create('div').class('qm-api-collapsible-toggle')
        .add(dom.create('i').class('qm-api-chevron-icon')))
      .add(dom.create('div').class('qm-api-collapsible-head')
        .add(header)))
    .add(dom.create('div').class('qm-api-collapsible-content')
      .add(content))
}
