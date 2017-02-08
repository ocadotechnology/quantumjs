describe('changelogList', () => {
  const quantum = require('quantum-js')
  const dom = require('quantum-dom')

  const changelogList = require('../../lib/entity-transforms/changelog-list')

  function transform (selection) {
    return dom.create('div').text(selection.type())
  }

  it('only transforms changelog entries', () => {
    const selection = quantum.select({
      type: 'changelogList',
      params: [],
      content: [
        {
          type: 'changelog',
          params: ['0.1.0'],
          content: []
        },
        {
          type: 'div',
          params: ['0.2.0'],
          content: []
        },
        {
          type: 'changelog',
          params: ['0.3.0'],
          content: []
        }
      ]
    })

    changelogList()(selection, transform).should.eql(
      dom.create('div').class('qm-changelog-list')
        .add(dom.create('div').text('changelog'))
        .add(dom.create('div').text('changelog'))
    )
  })
})
