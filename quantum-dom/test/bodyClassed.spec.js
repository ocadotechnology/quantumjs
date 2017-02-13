describe('bodyClassed', () => {
  const { bodyClassed } = require('..')
  it('creates the correct object when adding a class', () => {
    bodyClassed('something', true).should.eql({
      options: {
        type: 'body-classed',
        class: 'something',
        classed: true
      }
    })
  })
  it('creates the correct object when removing a class', () => {
    bodyClassed('other', false).should.eql({
      options: {
        type: 'body-classed',
        class: 'other',
        classed: false
      }
    })
  })
})
