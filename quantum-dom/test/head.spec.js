describe('head', () => {
  const { head } = require('..')
  it('creates the correct object', () => {
    head('something', true).should.eql({
      element: 'something',
      options: true
    })
  })
})
