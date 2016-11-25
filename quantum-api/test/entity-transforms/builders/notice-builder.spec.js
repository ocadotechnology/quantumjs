const chai = require('chai')
const quantum = require('quantum-js')
const dom = require('quantum-dom')
const noticeBuilder = require('../../../lib/entity-transforms/builders/notice-builder')

const should = chai.should()

describe('notice-builder', () => {
  it('should render nothing if there is no notice', () => {
    const selection = quantum.select({
      type: '',
      params: [],
      content: []
    })

    should.not.exist(noticeBuilder()(selection))
  })

  it('should render nothing if there is no content in the notice', () => {
    const selection = quantum.select({
      type: '',
      params: [],
      content: [
        {type: 'removed', params: [], content: []}
      ]
    })

    should.not.exist(noticeBuilder('removed', 'Removed')(selection))
  })

  it('should render a notice', () => {
    const selection = quantum.select({
      type: '',
      params: [],
      content: [
        {type: 'removed', params: [], content: ['Hi']}
      ]
    })

    function transformer (selection) {
      return selection
    }

    noticeBuilder('removed', 'Removed')(selection, transformer).should.eql(
      dom.create('div').class('qm-api-notice qm-api-notice-removed')
        .add(dom.create('div').class('qm-api-notice-header').add('Removed'))
        .add(dom.create('div').class('qm-api-notice-body').add('Hi'))
    )
  })
})
