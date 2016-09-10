const chai = require('chai')
const quantum = require('quantum-js')
const dom = require('quantum-dom')
const group = require('../../lib/transforms/group')
const bodyBuilders = require('../../lib/builders/body-builders')

chai.should()

describe('group', () => {
  it('should work with defaults', () => {
    const selection = quantum.select({
      type: 'group',
      params: [],
      content: []
    })

    group()(selection).should.eql(
      dom.create('div').class('qm-api-group')
    )
  })

  it('should work with defaults', () => {
    const selection = quantum.select({
      type: 'group',
      params: [],
      content: [
        {type: 'function', params: ['func1'], content: []}
      ]
    })

    function transformer (selection) {
      if (selection.type() === 'function') {
        return dom.create('div').class('test-function').text(selection.ps())
      }
    }

    group({builders: [bodyBuilders.functions()]})(selection, transformer).should.eql(
      dom.create('div').class('qm-api-group')
        .add(dom.create('div').class('qm-api-function-group')
          .add(dom.create('h2').text('Functions'))
          .add(dom.create('div').class('test-function').text('func1')))
    )
  })
})
