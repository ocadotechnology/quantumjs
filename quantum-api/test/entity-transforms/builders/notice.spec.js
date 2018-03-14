describe('notice', () => {
  const should = require('chai').should()
  const path = require('path')
  const quantum = require('quantum-core')
  const dom = require('quantum-dom')
  const notice = require('../../../lib/entity-transforms/builders/notice')

  const paragraphAsset = dom.asset({
    url: '/quantum-html.css',
    filename: path.join(__dirname, '../../../node_modules/quantum-html/assets/quantum-html.css'),
    shared: true
  })

  it('renders nothing if there is no notice', () => {
    const selection = quantum.select({
      type: '',
      params: [],
      content: []
    })

    should.not.exist(notice()(selection))
  })

  it('renders nothing if there is no content in the notice', () => {
    const selection = quantum.select({
      type: '',
      params: [],
      content: [
        {type: 'removed', params: [], content: []}
      ]
    })

    should.not.exist(notice('removed', 'Removed')(selection))
  })

  it('renders a notice', () => {
    const selection = quantum.select({
      type: '',
      params: [],
      content: [
        {
          type: 'removed',
          params: [],
          content: [
            {
              type: 'description',
              params: [],
              content: ['Hi']
            }
          ]
        }
      ]
    })

    function transformer (selection) {
      return selection
    }

    notice('removed', 'Removed')(selection, transformer).should.eql(
      dom.create('div').class('qm-api-notice qm-api-notice-removed')
        .add(dom.create('div').class('qm-api-notice-header').add('Removed'))
        .add(dom.create('div').class('qm-api-notice-body')
          .add(paragraphAsset)
          .add(dom.create('div').class('qm-html-paragraph')
            .add(dom.textNode('Hi '))))
    )
  })
})
