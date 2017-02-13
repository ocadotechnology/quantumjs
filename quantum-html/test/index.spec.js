'use strict'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const html = require('..')

chai.use(chaiAsPromised)
chai.should()

describe('module', () => {
  it('exports the correct things', () => {
    const keys = [
      'buildDOM',
      'buildHTML',
      'fileTransform',
      'HTMLPage',
      'htmlRenamer',
      'paragraphTransform',
      'prepareTransforms',
      'transforms'
    ]
    html.should.be.an('object')
    html.should.have.keys(keys)
    keys.forEach(key => html[key].should.be.a('function'))
  })

  require('./buildDOM.spec')
  require('./buildHTML.spec')
  require('./fileTransform.spec')
  require('./HTMLPage.spec')
  require('./htmlRenamer.spec')
  require('./paragraphTransform.spec')
  require('./prepareTransforms.spec')
  require('./transforms.spec')
})
