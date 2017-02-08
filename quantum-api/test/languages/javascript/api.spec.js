describe('api', () => {
  const quantum = require('quantum-js')
  const dom = require('quantum-dom')
  const type = require('../../../lib/entity-transforms/components/type')
  const javascript = require('../../../lib/languages/javascript')

  it('should render type entities', () => {
    const selection = quantum.select({
      type: 'type',
      params: [],
      content: ['MyType']
    })

    const typeLinks = {
      MyType: 'some_where'
    }

    javascript({typeLinks}).transforms.type(selection).should.eql(
      dom.create('span')
        .class('qm-api-type-standalone qm-code-font')
        .add(type(selection.cs(), typeLinks))
    )
  })
})
