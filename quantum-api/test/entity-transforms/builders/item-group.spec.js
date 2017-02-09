describe('item-group', () => {
  const should = require('chai').should()
  const quantum = require('quantum-js')
  const dom = require('quantum-dom')
  const itemGroup = require('../../../lib/entity-transforms/builders/item-group')
  const utils = require('../../../lib/utils')

  function transformer (selection) {
    return dom.create('div')
  }

  it('renders nothing if there is no item group to render', () => {
    const selection = quantum.select({
      type: '',
      params: [],
      content: []
    })

    should.not.exist(itemGroup()(selection))
  })

  it('renders something if the type is present (type and title should be passed through properly)', () => {
    const selection = quantum.select({
      type: '',
      params: [],
      content: [
        {type: 'function', params: ['func1'], content: []},
        {type: 'function', params: ['func2'], content: []},
        {type: 'notfunction', params: ['notfunc1'], content: []}
      ]
    })

    itemGroup('something', 'function', 'Functions')(selection, transformer).should.eql(
      dom.create('div').class('qm-api-function-group')
        .add(dom.create('h2').text('Functions'))
        .add(utils.organisedEntity(selection.filter('function')).transform(transformer))
    )
  })

  it('renders something if the type is present (array type) (type and title should be passed through properly)', () => {
    const selection = quantum.select({
      type: '',
      params: [],
      content: [
        {type: 'function', params: ['func1'], content: []},
        {type: 'function', params: ['func2'], content: []},
        {type: 'notfunction', params: ['notfunc1'], content: []}
      ]
    })

    itemGroup('something', ['function', 'notfunction'], 'Functions and more')(selection, transformer).should.eql(
      dom.create('div').class('qm-api-function-group')
        .add(dom.create('h2').text('Functions and more'))
        .add(utils.organisedEntity(selection).transform(transformer))
    )
  })
})