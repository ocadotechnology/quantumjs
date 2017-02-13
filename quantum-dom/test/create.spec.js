const { create, Element } = require('..')

describe('create', () => {
  it('creates an Element', () => {
    const elem = create('div');
    (elem instanceof Element).should.equal(true)
    elem.type.should.equal('div')
  })
})
