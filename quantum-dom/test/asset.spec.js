const dom = require('..')
const chai = require('chai')

const should = chai.should()

describe('asset', () => {
  it('creates an Asset with the default values', () => {
    should.not.exist(dom.asset().url)
    should.not.exist(dom.asset().filename)
    should.not.exist(dom.asset().type)
    should.not.exist(dom.asset().content)
  })

  it('creates an Asset with the default values (when an empty object is passed in)', () => {
    should.not.exist(dom.asset({}).url)
    should.not.exist(dom.asset({}).filename)
    should.not.exist(dom.asset({}).type)
    should.not.exist(dom.asset({}).content)
  })

  it('creates an Asset populated with url and filename values', () => {
    const asset = dom.asset({
      url: '/some/url',
      filename: 'filename.js'
    })

    asset.url.should.equal('/some/url')
    asset.filename.should.equal('filename.js')
    should.not.exist(asset.type)
    should.not.exist(asset.content)
  })

  it('creates an Asset populated with type and content values', () => {
    const asset = dom.asset({
      type: 'js',
      content: 'alert("test")'
    })

    should.not.exist(asset.url)
    should.not.exist(asset.filename)
    asset.type.should.equal('js')
    asset.content.should.equal('alert("test")')
  })
})
