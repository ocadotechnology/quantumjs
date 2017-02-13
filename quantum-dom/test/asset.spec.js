describe('asset', () => {
  const { asset } = require('..')
  it('defaults to the correct values', () => {
    const assetObj = asset()
    assetObj.url.should.equal('')
    assetObj.filename.should.equal('')
    assetObj.shared.should.equal(false)
  })

  it('defaults to the correct values (when an empty object is passed in)', () => {
    const assetObj = asset({})
    assetObj.url.should.equal('')
    assetObj.filename.should.equal('')
    assetObj.shared.should.equal(false)
  })
})
