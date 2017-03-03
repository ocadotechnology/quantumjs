const dom = require('..')

describe('head', () => {
  it('creates the correct object', () => {
    dom.head('something', true)
      .should.eql(new dom.HeadWrapper('something', true))
  })
})
