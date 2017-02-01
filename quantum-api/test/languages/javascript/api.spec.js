'use strict'

const chai = require('chai')
const path = require('path')
const quantum = require('quantum-js')
const dom = require('quantum-dom')
const type = require('../../../lib/entity-transforms/components/type')
const javascript = require('../../../lib/languages/javascript')

chai.should()

describe('api', () => {
  it('should render type entities', () => {
    const selection = quantum.select({
      type: 'type',
      params: [],
      content: ['MyType']
    })

    const typeLinks = {

    }

    javascript({typeLinks}).api.type(selection).should.eql(
      dom.create('span')
        .class('qm-api-type-standalone qm-code-font')
        .add(type(selection.cs(), typeLinks))
    )
  })
})
