const chai = require('chai')
const quantum = require('quantum-js')
const dom = require('quantum-dom')
const itemGroup = require('../../../lib/entity-transforms/builders/item-group')
const utils = require('../../../lib/utils')

const should = chai.should()

describe('item-group-builder', () => {
  it('should render nothing if there is no item group to render', () => {
    const selection = quantum.select({
      type: '',
      params: [],
      content: []
    })

    should.not.exist(itemGroup()(selection))
  })

  it('should render something if the type is present (type and title should be passed through properly)', () => {
    const selection = quantum.select({
      type: '',
      params: [],
      content: [
        {type: 'function', params: ['func1'], content: []},
        {type: 'function', params: ['func2'], content: []},
        {type: 'notfunction', params: ['notfunc1'], content: []}
      ]
    })

    function transform (selection) {
      return dom.create('div')
    }

    itemGroup('function', 'Functions')(selection, transform).should.eql(
      dom.create('div').class('qm-api-function-group')
        .add(dom.create('h2').text('Functions'))
        .add(utils.organisedEntity(selection.filter('function')).transform(transform))
    )
  })

  it('should render something if the type is present (array type) (type and title should be passed through properly)', () => {
    const selection = quantum.select({
      type: '',
      params: [],
      content: [
        {type: 'function', params: ['func1'], content: []},
        {type: 'function', params: ['func2'], content: []},
        {type: 'notfunction', params: ['notfunc1'], content: []}
      ]
    })

    function transform (selection) {
      return dom.create('div')
    }

    itemGroup(['function', 'notfunction'], 'Functions and more')(selection, transform).should.eql(
      dom.create('div').class('qm-api-function-group')
        .add(dom.create('h2').text('Functions and more'))
        .add(utils.organisedEntity(selection).transform(transform))
    )
  })
})
