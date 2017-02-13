describe('create', () => {
  const { create, Element } = require('..')
  it('creates an Element', () => {
    const elem = create('div');
    (elem instanceof Element).should.equal(true)
    elem.type.should.equal('div')
  })
})
