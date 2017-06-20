describe('header', () => {
  const quantum = require('quantum-core')
  const dom = require('quantum-dom')
  const header = require('../../../lib/entity-transforms/builders/header')

  function transformer (selection) {
    return dom.create('div').class('test').text(selection.cs())
  }

  it('builds a header using a provided detailsBuilder', () => {
    const selection = quantum.select({
      type: 'thing',
      params: [],
      content: ['bob']
    })

    function headerDetails (selection, transformer) {
      return transformer(selection)
    }

    header('thing', headerDetails)(selection, transformer).should.eql(
      dom.create('div').class(`qm-api-item-header qm-api-item-header-thing`)
        .add(dom.create('div')
          .class('test qm-api-header-details qm-code-font')
          .text('bob'))
        .add(dom.create('span').class('qm-api-header-tags')))
  })
})
