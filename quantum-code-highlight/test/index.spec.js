'use strict'

const chai = require('chai')
const codeHighlight = require('..')

chai.should()

describe('quantum-code-highlight', () => {
  it('exports the correct things', () => {
    codeHighlight.should.be.an('object')
    codeHighlight.should.have.keys(['transforms', 'stylesheetAsset', 'highlightCode'])
    codeHighlight.highlightCode.should.be.a('function')
    codeHighlight.stylesheetAsset.should.be.an('object')
    codeHighlight.transforms.should.be.a('function')
  })

  require('./transforms.spec')
})
