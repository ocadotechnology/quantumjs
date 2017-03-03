const dom = require('..')

describe('asset', () => {
  it('creates an Asset with the default values', () => {
    dom.asset().url.should.equal('')
    dom.asset().filename.should.equal('')
    dom.asset().shared.should.equal(false)
  })

  it('creates an Asset with the default values (when an empty object is passed in)', () => {
    dom.asset({}).url.should.equal('')
    dom.asset({}).filename.should.equal('')
    dom.asset({}).shared.should.equal(false)
  })

  it('creates an Asset populated with values', () => {
    dom.asset({
      url: '/some/url',
      filename: 'filename.js',
      shared: true
    }).should.eql(new dom.Asset('/some/url', 'filename.js', true))
  })
})
