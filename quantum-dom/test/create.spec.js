const dom = require('..')

describe('create', () => {
  it('creates an Element', () => {
    dom.create('div').should.eql(new dom.Element('div'))
  })
})
