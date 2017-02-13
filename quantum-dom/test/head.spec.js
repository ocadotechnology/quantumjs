const { head } = require('..')

describe('head', () => {
  it('creates the correct object', () => {
    head('something', true).should.eql({
      element: 'something',
      options: true
    })
  })
})
