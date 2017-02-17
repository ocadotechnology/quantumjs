const dom = require('..')

describe('bodyClassed', () => {
  it('creates the correct object when adding a class', () => {
    dom.bodyClassed('something', true)
      .should.eql(new dom.PageModifier({
        type: 'body-classed',
        class: 'something',
        classed: true
      }))
  })
  it('creates the correct object when removing a class', () => {
    dom.bodyClassed('other', false)
      .should.eql(new dom.PageModifier({
        type: 'body-classed',
        class: 'other',
        classed: false
      }))
  })
})
